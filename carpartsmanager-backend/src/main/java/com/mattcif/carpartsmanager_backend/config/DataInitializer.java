package com.mattcif.carpartsmanager_backend.config;

import com.mattcif.carpartsmanager_backend.model.PecaCarro;
import com.mattcif.carpartsmanager_backend.repository.PecaCarroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(PecaCarroRepository pecaRepo) {
        return args -> {
            if (pecaRepo.count() == 0) {
                List<PecaCarro> pecas = List.of(
                        new PecaCarro(null, "Filtro de Óleo", "FO123", "Bosch", "Fiat Uno", 50, new BigDecimal("25.90"), "Motor", null),
                        new PecaCarro(null, "Filtro de Óleo", "FO124", "Bosch", "Fiat Uno", 40, new BigDecimal("27.90"), "Motor", null),
                        new PecaCarro(null, "Pastilha de Freio", "PF456", "Cobreq", "Volkswagen Gol", 30, new BigDecimal("89.90"), "Freio", null),
                        new PecaCarro(null, "Pastilha de Freio", "PF457", "Cobreq", "Volkswagen Gol", 25, new BigDecimal("87.00"), "Freio", null),
                        new PecaCarro(null, "Amortecedor Dianteiro", "AD789", "Monroe", "Chevrolet Onix", 20, new BigDecimal("320.00"), "Suspensão", null),
                        new PecaCarro(null, "Amortecedor Traseiro", "AT788", "Monroe", "Chevrolet Onix", 18, new BigDecimal("310.00"), "Suspensão", null),
                        new PecaCarro(null, "Correia Dentada", "CD321", "Gates", "Ford Ka", 15, new BigDecimal("75.50"), "Motor", null),
                        new PecaCarro(null, "Correia Dentada", "CD322", "Gates", "Ford Ka", 10, new BigDecimal("78.00"), "Motor", null),
                        new PecaCarro(null, "Vela de Ignição", "VI654", "NGK", "Fiat Uno", 40, new BigDecimal("19.90"), "Ignição", null),
                        new PecaCarro(null, "Vela de Ignição", "VI655", "NGK", "Fiat Uno", 35, new BigDecimal("21.00"), "Ignição", null)
                );
                pecaRepo.saveAll(pecas);
            }
        };
    }
}
