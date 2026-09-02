package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.common.currency.dto.ConversionRequest;
import com.finora.common.currency.model.CurrencyCode;
import com.finora.common.currency.service.CurrencyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FinoraCurrencyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CurrencyService currencyService;

    @Test
    void testGetSupportedCurrenciesIncludesNamesAndCountries() throws Exception {
        mockMvc.perform(get("/api/v1/currencies/supported"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(9))
                .andExpect(jsonPath("$[?(@.code == 'INR')].name").value("Indian Rupee"))
                .andExpect(jsonPath("$[?(@.code == 'INR')].country").value("India"))
                .andExpect(jsonPath("$[?(@.code == 'INR')].symbol").value("₹"))
                .andExpect(jsonPath("$[?(@.code == 'INR')].flag").value("🇮🇳"))
                .andExpect(jsonPath("$[?(@.code == 'USD')].name").value("United States Dollar"))
                .andExpect(jsonPath("$[?(@.code == 'USD')].country").value("United States"))
                .andExpect(jsonPath("$[?(@.code == 'EUR')].name").value("Euro"))
                .andExpect(jsonPath("$[?(@.code == 'EUR')].country").value("European Union"));
    }

    @Test
    void testGetExchangeRates() throws Exception {
        mockMvc.perform(get("/api/v1/currencies/rates?base=INR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseCurrency").value("INR"))
                .andExpect(jsonPath("$.rates.INR").value(1.0))
                .andExpect(jsonPath("$.rates.USD").isNumber())
                .andExpect(jsonPath("$.rates.EUR").isNumber());
    }

    @Test
    void testConvertEndpointWithWorkedExample() throws Exception {
        // Worked example: convert 50000 INR to USD
        ConversionRequest request = ConversionRequest.builder()
                .amount(new BigDecimal("50000.00"))
                .fromCurrency("INR")
                .toCurrency("USD")
                .build();

        mockMvc.perform(post("/api/v1/currencies/convert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalAmount").value(50000.00))
                .andExpect(jsonPath("$.fromCurrency.code").value("INR"))
                .andExpect(jsonPath("$.fromCurrency.country").value("India"))
                .andExpect(jsonPath("$.toCurrency.code").value("USD"))
                .andExpect(jsonPath("$.toCurrency.country").value("United States"))
                .andExpect(jsonPath("$.convertedAmount").isNumber())
                .andExpect(jsonPath("$.formattedOriginal").value("₹50,000.00"));
    }

    @Test
    void testConvertToBaseForDatabasePersistence() throws Exception {
        // User inputs $150 USD -> should convert to INR for DB persistence
        mockMvc.perform(post("/api/v1/currencies/to-base")
                        .param("amount", "150.00")
                        .param("fromCurrency", "USD")
                        .param("baseCurrency", "INR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inputAmount").value(150.00))
                .andExpect(jsonPath("$.inputCurrency").value("USD"))
                .andExpect(jsonPath("$.baseCurrency").value("INR"))
                .andExpect(jsonPath("$.baseAmount").isNumber());
    }

    @Test
    void testCurrencyServiceDirectTwoWayCalculations() {
        // 1. Same currency conversion
        BigDecimal inrAmount = new BigDecimal("50000.00");
        BigDecimal convertedSame = currencyService.convertToBase(inrAmount, CurrencyCode.INR, CurrencyCode.INR);
        assertEquals(new BigDecimal("50000.00"), convertedSame);

        // 2. Converting to base currency (USD -> INR)
        BigDecimal usdInput = new BigDecimal("100.00");
        BigDecimal inrResult = currencyService.convertToBase(usdInput, CurrencyCode.USD, CurrencyCode.INR);
        assertTrue(inrResult.compareTo(new BigDecimal("7000.00")) > 0, "100 USD should be > 7000 INR");

        // 3. Converting from base currency to display (INR -> USD)
        BigDecimal usdDisplay = currencyService.convertFromBase(inrAmount, CurrencyCode.INR, CurrencyCode.USD);
        assertTrue(usdDisplay.compareTo(BigDecimal.ZERO) > 0);

        // 4. Formatting checks
        String formattedInr = currencyService.format(new BigDecimal("150000.50"), CurrencyCode.INR);
        assertEquals("₹1,50,000.50", formattedInr);
    }
}
