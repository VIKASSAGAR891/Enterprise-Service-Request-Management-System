package com.esrms.service;

import java.util.List;
import com.esrms.dao.AssetDAO;
import com.esrms.model.Asset;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    private final AssetDAO assetDAO = new AssetDAO();

    public boolean addAsset(Asset asset) {
        return assetDAO.addAsset(asset.getAssetName(), asset.getAssetType(), asset.getPurchaseDate());
    }

    public boolean updateAsset(int id, Asset asset) {
        return assetDAO.updateAsset(id, asset.getAssetName(), asset.getAssetType(), asset.getPurchaseDate());
    }

    public boolean deleteAsset(int id) {
        return assetDAO.deleteAsset(id);
    }

    public List<Asset> getAllAssets() {
        return assetDAO.getAllAssets();
    }

    public Asset getAssetById(int id) {
        return assetDAO.getAssetById(id);
    }

    public List<Asset> getAssetsByType(String type) {
        return assetDAO.getAssetsByType(type);
    }
}
