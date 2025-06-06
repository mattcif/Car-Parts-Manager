"use client"

import { useState } from "react"
import "./App.css"
import ExportarCSVForm from "./components/ExportarCSVForm.jsx"
import CadastrarPecaForm from "./components/CadastrarPecaForm.jsx"

function App() {
    const [currentView, setCurrentView] = useState("lista")
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [pecaParaEditar, setPecaParaEditar] = useState(null)

    const handlePecaCadastrada = () => {
        // Incrementar o trigger para forçar atualização da lista
        setRefreshTrigger((prev) => prev + 1)
        // Não mudar a view aqui, deixar o componente decidir
    }

    const handleEditarClick = (peca) => {
        setPecaParaEditar(peca)
        setCurrentView("editar")
    }

    const handleVoltarParaLista = () => {
        setPecaParaEditar(null)
        setCurrentView("lista")
        // Atualizar a lista quando voltar
        setRefreshTrigger((prev) => prev + 1)
    }

    const handleCadastrarClick = () => {
        setPecaParaEditar(null) // Limpar qualquer peça que estava sendo editada
        setCurrentView("cadastrar")
    }

    return (
        <>
            {currentView === "lista" ? (
                <ExportarCSVForm
                    onCadastrarClick={handleCadastrarClick}
                    onEditarClick={handleEditarClick}
                    refreshTrigger={refreshTrigger}
                />
            ) : currentView === "cadastrar" ? (
                <CadastrarPecaForm onVoltar={handleVoltarParaLista} onPecaCadastrada={handlePecaCadastrada} isEdicao={false} />
            ) : currentView === "editar" ? (
                <CadastrarPecaForm
                    onVoltar={handleVoltarParaLista}
                    onPecaCadastrada={handlePecaCadastrada}
                    pecaParaEditar={pecaParaEditar}
                    isEdicao={true}
                />
            ) : null}
        </>
    )
}

export default App
