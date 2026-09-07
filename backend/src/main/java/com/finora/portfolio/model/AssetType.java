package com.finora.portfolio.model;

/**
 * Discriminator for the JOINED-table-inheritance pt_asset hierarchy (Master Reference §6.7).
 */
public enum AssetType {
    STOCK,
    ETF,
    MUTUAL_FUND,
    NPS,
    DEPOSIT,
    BOND,
    METAL,
    REAL_ESTATE,
    OTHER
}
