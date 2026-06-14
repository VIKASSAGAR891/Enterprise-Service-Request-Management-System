package com.esrms.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.esrms.database.DBConnection;
import com.esrms.model.Asset;

/**
 * AssetDAO.java
 * 
 * Data Access Object for managing assets in the database.
 * Provides CRUD operations for asset management.
 */
public class AssetDAO {

    /**
     * Adds a new asset to the database
     * 
     * @param assetName The name of the asset
     * @param assetType The type/category of the asset
     * @param purchaseDate The purchase date of the asset
     * @return true if asset added successfully, false otherwise
     */
    public boolean addAsset(String assetName, String assetType, Date purchaseDate) {
        
        String sql = """
            INSERT INTO assets (asset_name, asset_type, purchase_date)
            VALUES (?, ?, ?)
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, assetName);
            ps.setString(2, assetType);
            ps.setDate(3, purchaseDate);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Asset added successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error adding asset: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Updates an existing asset's information
     * 
     * @param assetId The ID of the asset to update
     * @param assetName Updated asset name
     * @param assetType Updated asset type
     * @param purchaseDate Updated purchase date
     * @return true if update successful, false otherwise
     */
    public boolean updateAsset(int assetId, String assetName, 
                                String assetType, Date purchaseDate) {
        
        String sql = """
            UPDATE assets 
            SET asset_name = ?, asset_type = ?, purchase_date = ?
            WHERE asset_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, assetName);
            ps.setString(2, assetType);
            ps.setDate(3, purchaseDate);
            ps.setInt(4, assetId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Asset updated successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error updating asset: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Deletes an asset from the database
     * 
     * @param assetId The ID of the asset to delete
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteAsset(int assetId) {
        
        String sql = """
            DELETE FROM assets
            WHERE asset_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, assetId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Asset deleted successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error deleting asset: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Retrieves all assets from the database
     * 
     * @return List of all Asset objects
     */
    public List<Asset> getAllAssets() {
        
        List<Asset> assets = new ArrayList<>();
        String sql = """
            SELECT * FROM assets
            ORDER BY asset_id
            """;

        try (
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                Asset asset = mapResultSetToAsset(rs);
                assets.add(asset);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving all assets: " + e.getMessage());
            e.printStackTrace();
        }

        return assets;
    }

    /**
     * Retrieves a specific asset by ID
     * 
     * @param assetId The ID of the asset
     * @return Asset object or null if not found
     */
    public Asset getAssetById(int assetId) {
        
        String sql = """
            SELECT * FROM assets
            WHERE asset_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, assetId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapResultSetToAsset(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving asset by ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Retrieves assets filtered by type
     * 
     * @param assetType The type of assets to retrieve
     * @return List of Asset objects matching the type
     */
    public List<Asset> getAssetsByType(String assetType) {
        
        List<Asset> assets = new ArrayList<>();
        String sql = """
            SELECT * FROM assets
            WHERE asset_type = ?
            ORDER BY asset_id
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, assetType);
            
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Asset asset = mapResultSetToAsset(rs);
                assets.add(asset);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving assets by type: " + e.getMessage());
            e.printStackTrace();
        }

        return assets;
    }

    /**
     * Helper method to map ResultSet to Asset object
     * 
     * @param rs The ResultSet containing asset data
     * @return Asset object populated with data from ResultSet
     */
    private Asset mapResultSetToAsset(ResultSet rs) throws Exception {
        
        Asset asset = new Asset();
        
        asset.setAssetId(rs.getInt("asset_id"));
        asset.setAssetName(rs.getString("asset_name"));
        asset.setAssetType(rs.getString("asset_type"));
        asset.setPurchaseDate(rs.getDate("purchase_date"));
        
        return asset;
    }
}
