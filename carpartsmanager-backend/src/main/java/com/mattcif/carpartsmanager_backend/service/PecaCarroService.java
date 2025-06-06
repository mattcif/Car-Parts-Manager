package com.mattcif.carpartsmanager_backend.service;


import com.mattcif.carpartsmanager_backend.model.PecaCarro;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

public interface PecaCarroService {

    PecaCarro salvar(PecaCarro peca);

    List<PecaCarro> listarTodas();

    String exportarParaCsv(String fabricante, String categoria, String veiculo,
                           BigDecimal precoMin, BigDecimal precoMax, String codigo) throws IOException;

    void deletar(Long id);
}
