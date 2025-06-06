package com.mattcif.carpartsmanager_backend.service.serviceImpl;

import com.mattcif.carpartsmanager_backend.model.PecaCarro;
import com.mattcif.carpartsmanager_backend.repository.PecaCarroRepository;
import com.mattcif.carpartsmanager_backend.service.PecaCarroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class PecaCarroServiceImpl implements PecaCarroService {

    @Autowired
    private PecaCarroRepository pecaCarroRepository;

    @Override
    public PecaCarro salvar(PecaCarro peca) {
        return pecaCarroRepository.save(peca);
    }

    @Override
    public List<PecaCarro> listarTodas() {
        return pecaCarroRepository.findAll();
    }

    @Override
    public void deletar(Long id) {
        pecaCarroRepository.deleteById(id);
    }

    @Override
    public String exportarParaCsv(String fabricante, String categoria, String veiculo,
                                  BigDecimal precoMin, BigDecimal precoMax, String codigo) throws IOException {
        List<PecaCarro> pecas = pecaCarroRepository.findAll().stream()
                .filter(p -> fabricante == null || p.getFabricante().toLowerCase().contains(fabricante.toLowerCase()))
                .filter(p -> categoria == null || p.getCategoria().toLowerCase().contains(categoria.toLowerCase()))
                .filter(p -> veiculo == null || p.getVeiculoCompativel().toLowerCase().contains(veiculo.toLowerCase()))
                .filter(p -> precoMin == null || p.getPrecoUnitario().compareTo(precoMin) >= 0)
                .filter(p -> precoMax == null || p.getPrecoUnitario().compareTo(precoMax) <= 0)
                .filter(p -> codigo == null || p.getCodigo().toUpperCase().equals(codigo))
                .toList();

        StringBuilder nomeBuilder = new StringBuilder("pecas");
        if (fabricante != null) nomeBuilder.append("-").append(fabricante.replaceAll("\\s+", "_"));
        if (categoria != null) nomeBuilder.append("-").append(categoria.replaceAll("\\s+", "_"));
        if (veiculo != null) nomeBuilder.append("-").append(veiculo.replaceAll("\\s+", "_"));
        if (precoMin != null) nomeBuilder.append("-min").append(precoMin.intValue());
        if (precoMax != null) nomeBuilder.append("-max").append(precoMax.intValue());
        if (codigo != null) nomeBuilder.append("-codigo").append(codigo.replaceAll("\\s+", "_"));

        nomeBuilder.append("-").append(LocalDate.now()).append(".csv");
        String nomeArquivo = nomeBuilder.toString();
        String caminho = "data-lake/" + nomeArquivo;

        File pasta = new File("data-lake");
        if (!pasta.exists()) {
            pasta.mkdirs();
        }

        try (OutputStreamWriter writer = new OutputStreamWriter(
                new FileOutputStream(caminho), StandardCharsets.UTF_8)) {

            // BOM UTF-8
            writer.write('\uFEFF');

            writer.write("ID;\"Nome\";\"Código\";\"Fabricante\";\"Veículo\";\"Estoque\";\"Preço\";\"Categoria\";\"DataCadastro\"\n");

            for (PecaCarro p : pecas) {
                writer.write(p.getId() + ";");
                writer.write("\"" + p.getNome() + "\";");
                writer.write("\"" + p.getCodigo() + "\";");
                writer.write("\"" + p.getFabricante() + "\";");
                writer.write("\"" + p.getVeiculoCompativel() + "\";");
                writer.write(p.getQuantidadeEstoque() + ";");
                writer.write(p.getPrecoUnitario().toString().replace(".", ",") + ";");
                writer.write("\"" + p.getCategoria() + "\";");
                writer.write(p.getDataCadastro().toString() + "\n");
            }
        }

        return caminho;
    }

}
