"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"
import "../styles/dashboard.css"
import {RiDeleteBin5Fill, RiFileExcel2Line} from "react-icons/ri";
import {FaEdit} from "react-icons/fa";
import {LiaBroomSolid} from "react-icons/lia";
import {GiBroom} from "react-icons/gi";

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function ExportarCSVForm({ onCadastrarClick, onEditarClick, refreshTrigger }) {
    const [filtros, setFiltros] = useState({
        fabricante: "",
        categoria: "",
        veiculo: "",
        precoMin: "",
        precoMax: "",
        codigo: "",
    })

    const [pecas, setPecas] = useState([])
    const [pecasFiltradas, setPecasFiltradas] = useState([])
    const [estatisticas, setEstatisticas] = useState([])
    const [mensagem, setMensagem] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadingEstatisticas, setLoadingEstatisticas] = useState(true)
    const [exportando, setExportando] = useState(false)
    const [deletando, setDeletando] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [pecaParaDeletar, setPecaParaDeletar] = useState(null)

    // Buscar todas as peças ao carregar o componente ou quando refreshTrigger mudar
    useEffect(() => {
        buscarPecas()
        buscarEstatisticas()
    }, [refreshTrigger])

    // Filtrar peças sempre que os filtros ou peças mudarem
    useEffect(() => {
        filtrarPecas()
    }, [filtros, pecas])

    const buscarPecas = async () => {
        try {
            setLoading(true)
            const response = await axios.get("http://localhost:8081/pecas")
            setPecas(response.data)
            setPecasFiltradas(response.data)
        } catch (error) {
            setMensagem("Erro ao carregar peças: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const buscarEstatisticas = async () => {
        try {
            setLoadingEstatisticas(true)
            const response = await axios.get("http://localhost:8081/pecas/estatisticas/categorias")
            setEstatisticas(response.data)
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error)
            setEstatisticas([])
        } finally {
            setLoadingEstatisticas(false)
        }
    }

    const filtrarPecas = () => {
        const resultado = pecas.filter((peca) => {
            const matchFabricante =
                !filtros.fabricante || peca.fabricante.toLowerCase().includes(filtros.fabricante.toLowerCase())

            const matchCategoria =
                !filtros.categoria || peca.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())

            const matchVeiculo =
                !filtros.veiculo || peca.veiculoCompativel.toLowerCase().includes(filtros.veiculo.toLowerCase())

            const matchPrecoMin = !filtros.precoMin || peca.precoUnitario >= Number.parseFloat(filtros.precoMin)

            const matchPrecoMax = !filtros.precoMax || peca.precoUnitario <= Number.parseFloat(filtros.precoMax)

            const matchCodigo = !filtros.codigo || peca.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())

            return matchFabricante && matchCategoria && matchVeiculo && matchPrecoMin && matchPrecoMax && matchCodigo
        })

        setPecasFiltradas(resultado)
    }

    const handleChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value })
    }

    const limparFiltros = () => {
        setFiltros({
            fabricante: "",
            categoria: "",
            veiculo: "",
            precoMin: "",
            precoMax: "",
            codigo: "",
        })
    }

    const handleEditar = (peca) => {
        if (onEditarClick) {
            onEditarClick(peca)
        }
    }

    const handleDeletar = (peca) => {
        setPecaParaDeletar(peca)
        setShowDeleteModal(true)
    }

    const confirmarDelecao = async () => {
        if (!pecaParaDeletar) return

        try {
            setDeletando(pecaParaDeletar.id)
            await axios.delete(`http://localhost:8081/pecas/${pecaParaDeletar.id}`)

            // Atualizar a lista removendo a peça deletada
            setPecas(pecas.filter((p) => p.id !== pecaParaDeletar.id))
            setPecasFiltradas(pecasFiltradas.filter((p) => p.id !== pecaParaDeletar.id))

            setMensagem(`✅ Peça "${pecaParaDeletar.nome}" deletada com sucesso!`)
            setTimeout(() => setMensagem(""), 5000)

            // Atualizar estatísticas
            buscarEstatisticas()
        } catch (error) {
            console.error("Erro ao deletar peça:", error)
            setMensagem(`❌ Erro ao deletar peça: ${error.response?.data || error.message}`)
        } finally {
            setDeletando(null)
            setShowDeleteModal(false)
            setPecaParaDeletar(null)
        }
    }

    const cancelarDelecao = () => {
        setShowDeleteModal(false)
        setPecaParaDeletar(null)
    }

    const exportar = async () => {
        try {
            setExportando(true)
            const params = {}
            for (const key in filtros) {
                if (filtros[key]) params[key] = filtros[key]
            }

            // Fazer requisição para gerar e baixar o CSV
            const response = await axios.get("http://localhost:8081/pecas/exportar", {
                params,
                responseType: "blob", // Importante para receber o arquivo como blob
            })

            // Criar um blob URL para o arquivo
            const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" })
            const url = window.URL.createObjectURL(blob)

            // Gerar nome do arquivo baseado nos filtros aplicados
            let nomeArquivo = "pecas"
            if (filtros.fabricante) nomeArquivo += `-${filtros.fabricante.replace(/\s+/g, "_")}`
            if (filtros.categoria) nomeArquivo += `-${filtros.categoria.replace(/\s+/g, "_")}`
            if (filtros.veiculo) nomeArquivo += `-${filtros.veiculo.replace(/\s+/g, "_")}`
            if (filtros.codigo) nomeArquivo += `-${filtros.codigo.replace(/\s+/g, "_")}`
            if (filtros.precoMin) nomeArquivo += `-min${filtros.precoMin}`
            if (filtros.precoMax) nomeArquivo += `-max${filtros.precoMax}`

            const dataAtual = new Date().toISOString().split("T")[0]
            nomeArquivo += `-${dataAtual}.csv`

            // Criar link temporário para download
            const link = document.createElement("a")
            link.href = url
            link.download = nomeArquivo
            document.body.appendChild(link)
            link.click()

            // Limpar recursos
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            setMensagem(`✅ Arquivo "${nomeArquivo}" baixado com sucesso! (${pecasFiltradas.length} peças exportadas)`)

            // Limpar mensagem após 5 segundos
            setTimeout(() => setMensagem(""), 5000)
        } catch (err) {
            console.error("Erro ao exportar CSV:", err)
            setMensagem("❌ Erro ao exportar CSV: " + (err.response?.data || err.message))
        } finally {
            setExportando(false)
        }
    }

    const exportarFiltradas = () => {
        if (pecasFiltradas.length === 0) {
            setMensagem("❌ Nenhuma peça para exportar. Ajuste os filtros.")
            return
        }

        try {
            // Criar conteúdo CSV das peças filtradas
            const csvContent = [
                // Cabeçalho
                'ID;"Nome";"Código";"Fabricante";"Veículo";"Estoque";"Preço";"Categoria";"DataCadastro"',
                // Dados
                ...pecasFiltradas.map(
                    (peca) =>
                        `${peca.id};"${peca.nome}";"${peca.codigo}";"${peca.fabricante}";"${peca.veiculoCompativel}";${peca.quantidadeEstoque};${peca.precoUnitario.toString().replace(".", ",")};"${peca.categoria}";${peca.dataCadastro}`,
                ),
            ].join("\n")

            // Adicionar BOM UTF-8 para caracteres especiais
            const bom = "\uFEFF"
            const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })
            const url = window.URL.createObjectURL(blob)

            // Gerar nome do arquivo
            let nomeArquivo = "pecas-filtradas"
            const dataAtual = new Date().toISOString().split("T")[0]
            nomeArquivo += `-${dataAtual}.csv`

            // Download
            const link = document.createElement("a")
            link.href = url
            link.download = nomeArquivo
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            setMensagem(`✅ Arquivo "${nomeArquivo}" baixado com sucesso! (${pecasFiltradas.length} peças exportadas)`)
            setTimeout(() => setMensagem(""), 5000)
        } catch (error) {
            console.error("Erro ao exportar filtradas:", error)
            setMensagem("❌ Erro ao exportar peças filtradas: " + error.message)
        }
    }

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(preco)
    }

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString("pt-BR")
    }

    const getCorCategoria = (categoria) => {
        const cores = {
            Motor: "danger",
            Freios: "warning",
            Suspensão: "info",
            Elétrica: "success",
            Carroceria: "primary",
            Transmissão: "secondary",
        }
        return cores[categoria] || "dark"
    }

    // Configuração do gráfico de pizza
    const chartData = {
        labels: estatisticas.map((item) => item.categoria),
        datasets: [
            {
                label: "Quantidade de Peças",
                data: estatisticas.map((item) => item.quantidade),
                backgroundColor: [
                    "#FF6384", // Rosa vibrante
                    "#36A2EB", // Azul
                    "#FFCE56", // Amarelo
                    "#4BC0C0", // Verde água
                    "#9966FF", // Roxo
                    "#FF9F40", // Laranja
                    "#FF6384", // Rosa (repetindo para mais categorias)
                    "#C9CBCF", // Cinza
                ],
                borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"],
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: "#fff",
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12,
                        weight: "500",
                    },
                },
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#fff",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((context.parsed * 100) / total).toFixed(1)
                        return `${context.label}: ${context.parsed} peças (${percentage}%)`
                    },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
        },
        cutout: "60%", // Para fazer um doughnut chart
    }

    // Configuração do gráfico de barras
    const barChartData = {
        labels: estatisticas.map((item) => item.categoria),
        datasets: [
            {
                label: "Quantidade de Peças",
                data: estatisticas.map((item) => item.quantidade),
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    }

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#fff",
                borderWidth: 1,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
        animation: {
            duration: 1000,
            easing: "easeInOutQuart",
        },
    }

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="loading-container">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                        <h5 className="text-muted">Carregando peças...</h5>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid">
            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="modal fade show d-block modal-overlay" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Confirmar Exclusão
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={cancelarDelecao}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center">
                                    <i className="bi bi-trash3-fill text-danger icon-xl mb-3"></i>
                                    <h6>Tem certeza que deseja excluir esta peça?</h6>
                                    {pecaParaDeletar && (
                                        <div className="alert alert-light mt-3">
                                            <strong>{pecaParaDeletar.nome}</strong>
                                            <br />
                                            <small className="text-muted">Código: {pecaParaDeletar.codigo}</small>
                                        </div>
                                    )}
                                    <p className="text-muted small">Esta ação não pode ser desfeita.</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={cancelarDelecao}>
                                    <i className="bi bi-x-circle me-1"></i>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmarDelecao}
                                    disabled={deletando === pecaParaDeletar?.id}
                                >
                                    {deletando === pecaParaDeletar?.id ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Excluindo...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-trash3 me-1"></i>
                                            Excluir
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">
                                <i className="bi bi-gear-fill text-primary me-2"></i>
                                Gerenciador de Peças
                            </h2>
                            <p className="text-muted mb-0">Visualize, filtre e exporte suas peças de carro</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary" onClick={buscarPecas} disabled={loading}>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Atualizar
                            </button>
                            <button className="btn btn-primary" onClick={onCadastrarClick}>
                                <i className="bi bi-plus-circle me-1"></i>
                                Nova Peça
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="card-header bg-light">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-funnel me-2"></i>
                        Filtros
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6 col-lg-2">
                            <label className="form-label fw-semibold">Fabricante</label>
                            <input
                                type="text"
                                name="fabricante"
                                placeholder="Ex: Bosch, Continental..."
                                value={filtros.fabricante}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-6 col-lg-2">
                            <label className="form-label fw-semibold">Código</label>
                            <input
                                type="text"
                                name="codigo"
                                placeholder="Ex: ABC123, XYZ-789..."
                                value={filtros.codigo}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-6 col-lg-2">
                            <label className="form-label fw-semibold">Categoria</label>
                            <input
                                type="text"
                                name="categoria"
                                placeholder="Ex: Motor, Freios..."
                                value={filtros.categoria}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-6 col-lg-2">
                            <label className="form-label fw-semibold">Veículo</label>
                            <input
                                type="text"
                                name="veiculo"
                                placeholder="Ex: Civic, Corolla..."
                                value={filtros.veiculo}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-3 col-lg-1">
                            <label className="form-label fw-semibold">Preço Min</label>
                            <input
                                type="number"
                                name="precoMin"
                                placeholder="0"
                                value={filtros.precoMin}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="col-md-3 col-lg-1">
                            <label className="form-label fw-semibold">Preço Max</label>
                            <input
                                type="number"
                                name="precoMax"
                                placeholder="9999"
                                value={filtros.precoMax}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="col-md-6 col-lg-1 d-flex align-items-end">
                            <button onClick={limparFiltros} className="btn btn-outline-secondary w-100" title="Limpar filtros">
                                <GiBroom />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total de Peças</h6>
                                    <h3 className="mb-0">{pecas.length}</h3>
                                </div>
                                <i className="bi bi-box-seam icon-large fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Filtradas</h6>
                                    <h3 className="mb-0">{pecasFiltradas.length}</h3>
                                </div>
                                <i className="bi bi-funnel icon-large fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Valor Total</h6>
                                    <h3 className="mb-0">
                                        {formatarPreco(
                                            pecasFiltradas.reduce((total, peca) => total + peca.precoUnitario * peca.quantidadeEstoque, 0),
                                        )}
                                    </h3>
                                </div>
                                <i className="bi bi-currency-dollar icon-large fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Estoque Total</h6>
                                    <h3 className="mb-0">{pecasFiltradas.reduce((total, peca) => total + peca.quantidadeEstoque, 0)}</h3>
                                </div>
                                <i className="bi bi-boxes icon-large fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensagem */}
            {mensagem && (
                <div
                    className={`alert ${mensagem.includes("✅") ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
                >
                    {mensagem}
                    <button type="button" className="btn-close" onClick={() => setMensagem("")}></button>
                </div>
            )}

            {/* Tabela */}
            <div className="card">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-table me-2"></i>
                        Lista de Peças ({pecasFiltradas.length})
                    </h5>
                    <div className="d-flex gap-2">
                        <div className="btn-group" role="group">
                            <button
                                onClick={exportar}
                                className="btn btn-success"
                                disabled={exportando || pecasFiltradas.length === 0}
                                title="Exportar via backend (com filtros aplicados)"
                            >
                                {exportando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-cloud-download me-2"></i>
                                        Exportar CSV
                                    </>
                                )}
                            </button>
                            <button
                                onClick={exportarFiltradas}
                                className="btn btn-outline-success"
                                disabled={pecasFiltradas.length === 0}
                                title="Exportar apenas peças visíveis na tabela"
                            >
                                <i className="bi bi-download me-1"></i>
                                Baixar Filtradas
                            </button>
                        </div>
                        <button className="btn btn-primary" onClick={onCadastrarClick}>
                            <i className="bi bi-plus-circle me-1"></i>
                            Nova Peça
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    {pecasFiltradas.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-inbox icon-xl text-muted mb-3"></i>
                            <h5 className="text-muted">Nenhuma peça encontrada</h5>
                            <p className="text-muted">Tente ajustar os filtros ou adicionar novas peças</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Código</th>
                                    <th scope="col">Fabricante</th>
                                    <th scope="col">Veículo</th>
                                    <th scope="col">Categoria</th>
                                    <th scope="col">Estoque</th>
                                    <th scope="col">Preço Unit.</th>
                                    <th scope="col">Valor Total</th>
                                    <th scope="col">Data Cadastro</th>
                                    <th scope="col" className="text-center">
                                        Ações
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {pecasFiltradas.map((peca, index) => (
                                    <tr key={peca.id}>
                                        <td className="fw-semibold">{peca.id}</td>
                                        <td className="fw-semibold text-primary">{peca.nome}</td>
                                        <td>
                                            <code className="code-badge">{peca.codigo}</code>
                                        </td>
                                        <td>{peca.fabricante}</td>
                                        <td>{peca.veiculoCompativel}</td>
                                        <td>
                                            <span className={`badge bg-${getCorCategoria(peca.categoria)}`}>{peca.categoria}</span>
                                        </td>
                                        <td>
                        <span className={`badge ${peca.quantidadeEstoque < 10 ? "bg-danger" : "bg-success"}`}>
                          {peca.quantidadeEstoque}
                        </span>
                                        </td>
                                        <td className="fw-semibold">{formatarPreco(peca.precoUnitario)}</td>
                                        <td className="fw-bold text-success">
                                            {formatarPreco(peca.precoUnitario * peca.quantidadeEstoque)}
                                        </td>
                                        <td className="text-muted">{formatarData(peca.dataCadastro)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEditar(peca)}
                                                    title="Editar peça"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeletar(peca)}
                                                    title="Excluir peça"
                                                    disabled={deletando === peca.id}
                                                >
                                                    {deletando === peca.id ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <RiDeleteBin5Fill />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Gráficos de Estatísticas - Movidos para o final */}
            <div className="row mt-4">
                <div className="col-12 mb-3">
                    <h4>
                        <i className="bi bi-graph-up me-2"></i>
                        Análise de Dados
                    </h4>
                    <p className="text-muted">Visualização gráfica da distribuição de peças por categoria</p>
                </div>
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header header-gradient-purple">
                            <h5 className="card-title mb-0 text-white">
                                <i className="bi bi-pie-chart-fill me-2"></i>
                                Distribuição por Categoria
                            </h5>
                        </div>
                        <div className="card-body chart-wrapper">
                            {loadingEstatisticas ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Carregando estatísticas...</span>
                                    </div>
                                    <p className="text-muted">Carregando gráfico...</p>
                                </div>
                            ) : estatisticas.length > 0 ? (
                                <div className="chart-container">
                                    <Doughnut data={chartData} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i className="bi bi-graph-down icon-xl text-muted mb-3"></i>
                                    <h6 className="text-muted">Nenhum dado disponível</h6>
                                    <p className="text-muted small">Adicione peças para ver as estatísticas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header header-gradient-pink">
                            <h5 className="card-title mb-0 text-white">
                                <i className="bi bi-bar-chart-fill me-2"></i>
                                Quantidade por Categoria
                            </h5>
                        </div>
                        <div className="card-body chart-wrapper">
                            {loadingEstatisticas ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Carregando estatísticas...</span>
                                    </div>
                                    <p className="text-muted">Carregando gráfico...</p>
                                </div>
                            ) : estatisticas.length > 0 ? (
                                <div className="chart-container">
                                    <Bar data={barChartData} options={barChartOptions} />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i className="bi bi-graph-down icon-xl text-muted mb-3"></i>
                                    <h6 className="text-muted">Nenhum dado disponível</h6>
                                    <p className="text-muted small">Adicione peças para ver as estatísticas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
