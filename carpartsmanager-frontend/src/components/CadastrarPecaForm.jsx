"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function CadastrarPecaForm({ onVoltar, onPecaCadastrada, pecaParaEditar, isEdicao = false }) {
    const [peca, setPeca] = useState({
        nome: "",
        codigo: "",
        fabricante: "",
        veiculoCompativel: "",
        quantidadeEstoque: 0,
        precoUnitario: 0,
        categoria: "",
    })

    const [loading, setLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" })
    const [erros, setErros] = useState({})

    const categorias = ["Motor", "Freios", "Suspensão", "Elétrica", "Carroceria", "Transmissão", "Outros"]

    // Preencher campos quando estiver editando
    useEffect(() => {
        if (isEdicao && pecaParaEditar) {
            setPeca({
                nome: pecaParaEditar.nome || "",
                codigo: pecaParaEditar.codigo || "",
                fabricante: pecaParaEditar.fabricante || "",
                veiculoCompativel: pecaParaEditar.veiculoCompativel || "",
                quantidadeEstoque: pecaParaEditar.quantidadeEstoque || 0,
                precoUnitario: pecaParaEditar.precoUnitario || 0,
                categoria: pecaParaEditar.categoria || "",
            })
        }
    }, [isEdicao, pecaParaEditar])

    const handleChange = (e) => {
        const { name, value } = e.target

        // Tratamento especial para campos numéricos
        if (name === "quantidadeEstoque") {
            setPeca({ ...peca, [name]: Number.parseInt(value) || 0 })
        } else if (name === "precoUnitario") {
            setPeca({ ...peca, [name]: Number.parseFloat(value) || 0 })
        } else {
            setPeca({ ...peca, [name]: value })
        }
    }

    const validarFormulario = () => {
        const novosErros = {}

        if (!peca.nome.trim()) novosErros.nome = "Nome é obrigatório"
        if (!peca.codigo.trim()) novosErros.codigo = "Código é obrigatório"
        if (!peca.fabricante.trim()) novosErros.fabricante = "Fabricante é obrigatório"
        if (!peca.veiculoCompativel.trim()) novosErros.veiculoCompativel = "Veículo compatível é obrigatório"
        if (!peca.categoria) novosErros.categoria = "Categoria é obrigatória"
        if (peca.quantidadeEstoque < 0) novosErros.quantidadeEstoque = "Quantidade não pode ser negativa"
        if (peca.precoUnitario <= 0) novosErros.precoUnitario = "Preço deve ser maior que zero"

        setErros(novosErros)
        return Object.keys(novosErros).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validarFormulario()) {
            setMensagem({
                texto: "Por favor, corrija os erros no formulário.",
                tipo: "danger",
            })
            return
        }

        try {
            setLoading(true)
            let response

            if (isEdicao && pecaParaEditar) {
                // Atualizar peça existente
                response = await axios.put(`http://localhost:8081/pecas/${pecaParaEditar.id}`, peca)
                setMensagem({
                    texto: `✅ Peça "${response.data.nome}" atualizada com sucesso!`,
                    tipo: "success",
                })
            } else {
                // Criar nova peça
                response = await axios.post("http://localhost:8081/pecas", peca)
                setMensagem({
                    texto: `✅ Peça "${response.data.nome}" cadastrada com sucesso!`,
                    tipo: "success",
                })

                // Limpar formulário apenas no cadastro
                setPeca({
                    nome: "",
                    codigo: "",
                    fabricante: "",
                    veiculoCompativel: "",
                    quantidadeEstoque: 0,
                    precoUnitario: 0,
                    categoria: "",
                })
            }

            // Notificar componente pai
            if (onPecaCadastrada) {
                onPecaCadastrada(response.data)
            }

            // Limpar mensagem após 3 segundos
            setTimeout(() => {
                setMensagem({ texto: "", tipo: "" })
                if (isEdicao) {
                    // Voltar para lista após edição
                    onVoltar()
                }
            }, 2000)
        } catch (error) {
            console.error("Erro ao salvar peça:", error)
            setMensagem({
                texto: `❌ Erro ao ${isEdicao ? "atualizar" : "cadastrar"} peça: ${error.response?.data || error.message}`,
                tipo: "danger",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">
                                {isEdicao ? (
                                    <>
                                        <i className="bi bi-pencil-square text-warning me-2"></i>
                                        Editar Peça
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle-fill text-success me-2"></i>
                                        Cadastrar Nova Peça
                                    </>
                                )}
                            </h2>
                            <p className="text-muted mb-0">
                                {isEdicao ? "Atualize as informações da peça" : "Adicione uma nova peça ao sistema"}
                            </p>
                        </div>
                        <button className="btn btn-outline-secondary" onClick={onVoltar}>
                            <i className="bi bi-arrow-left me-2"></i>
                            Voltar para Lista
                        </button>
                    </div>
                </div>
            </div>

            {/* Informações da peça sendo editada */}
            {isEdicao && pecaParaEditar && (
                <div className="alert alert-info d-flex align-items-center mb-4">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <div>
                        <strong>Editando:</strong> {pecaParaEditar.nome}
                        <br />
                        <small>
                            ID: {pecaParaEditar.id} | Código: {pecaParaEditar.codigo}
                        </small>
                    </div>
                </div>
            )}

            {/* Mensagem */}
            {mensagem.texto && (
                <div className={`alert alert-${mensagem.tipo} alert-dismissible fade show`}>
                    {mensagem.texto}
                    <button type="button" className="btn-close" onClick={() => setMensagem({ texto: "", tipo: "" })}></button>
                </div>
            )}

            {/* Formulário */}
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-pencil-square me-2"></i>
                        Informações da Peça
                    </h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Nome */}
                            <div className="col-md-6">
                                <label htmlFor="nome" className="form-label fw-semibold">
                                    Nome da Peça*
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${erros.nome ? "is-invalid" : ""}`}
                                    id="nome"
                                    name="nome"
                                    value={peca.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: Filtro de Óleo Premium"
                                />
                                {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
                            </div>

                            {/* Código */}
                            <div className="col-md-6">
                                <label htmlFor="codigo" className="form-label fw-semibold">
                                    Código*
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${erros.codigo ? "is-invalid" : ""}`}
                                    id="codigo"
                                    name="codigo"
                                    value={peca.codigo}
                                    onChange={handleChange}
                                    placeholder="Ex: FLT-123-XYZ"
                                />
                                {erros.codigo && <div className="invalid-feedback">{erros.codigo}</div>}
                            </div>

                            {/* Fabricante */}
                            <div className="col-md-6">
                                <label htmlFor="fabricante" className="form-label fw-semibold">
                                    Fabricante*
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${erros.fabricante ? "is-invalid" : ""}`}
                                    id="fabricante"
                                    name="fabricante"
                                    value={peca.fabricante}
                                    onChange={handleChange}
                                    placeholder="Ex: Bosch, Continental"
                                />
                                {erros.fabricante && <div className="invalid-feedback">{erros.fabricante}</div>}
                            </div>

                            {/* Veículo Compatível */}
                            <div className="col-md-6">
                                <label htmlFor="veiculoCompativel" className="form-label fw-semibold">
                                    Veículo Compatível*
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${erros.veiculoCompativel ? "is-invalid" : ""}`}
                                    id="veiculoCompativel"
                                    name="veiculoCompativel"
                                    value={peca.veiculoCompativel}
                                    onChange={handleChange}
                                    placeholder="Ex: Honda Civic 2020, Toyota Corolla 2019-2022"
                                />
                                {erros.veiculoCompativel && <div className="invalid-feedback">{erros.veiculoCompativel}</div>}
                            </div>

                            {/* Categoria */}
                            <div className="col-md-4">
                                <label htmlFor="categoria" className="form-label fw-semibold">
                                    Categoria*
                                </label>
                                <select
                                    className={`form-select ${erros.categoria ? "is-invalid" : ""}`}
                                    id="categoria"
                                    name="categoria"
                                    value={peca.categoria}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                {erros.categoria && <div className="invalid-feedback">{erros.categoria}</div>}
                            </div>

                            {/* Quantidade em Estoque */}
                            <div className="col-md-4">
                                <label htmlFor="quantidadeEstoque" className="form-label fw-semibold">
                                    Quantidade em Estoque*
                                </label>
                                <input
                                    type="number"
                                    className={`form-control ${erros.quantidadeEstoque ? "is-invalid" : ""}`}
                                    id="quantidadeEstoque"
                                    name="quantidadeEstoque"
                                    value={peca.quantidadeEstoque}
                                    onChange={handleChange}
                                    min="0"
                                />
                                {erros.quantidadeEstoque && <div className="invalid-feedback">{erros.quantidadeEstoque}</div>}
                            </div>

                            {/* Preço Unitário */}
                            <div className="col-md-4">
                                <label htmlFor="precoUnitario" className="form-label fw-semibold">
                                    Preço Unitário (R$)*
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">R$</span>
                                    <input
                                        type="number"
                                        className={`form-control ${erros.precoUnitario ? "is-invalid" : ""}`}
                                        id="precoUnitario"
                                        name="precoUnitario"
                                        value={peca.precoUnitario}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                    />
                                    {erros.precoUnitario && <div className="invalid-feedback">{erros.precoUnitario}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-outline-secondary" onClick={onVoltar}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {isEdicao ? "Atualizando..." : "Salvando..."}
                                    </>
                                ) : (
                                    <>
                                        <i className={`bi ${isEdicao ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                                        {isEdicao ? "Atualizar Peça" : "Cadastrar Peça"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
