package com.esrms.model;

import java.sql.Date;

public class Asset {

    private int assetId;
    private String assetName;
    private String assetType;
    private Date purchaseDate;

    public Asset() {}

    public Asset(int assetId, String assetName,
                 String assetType, Date purchaseDate) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetType = assetType;
        this.purchaseDate = purchaseDate;
    }

    public int getAssetId() {
        return assetId;
    }

    public void setAssetId(int assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public Date getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(Date purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}