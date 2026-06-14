package com.esrms.controller;

import java.util.List;
import com.esrms.model.Asset;
import com.esrms.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable int id) {
        Asset asset = assetService.getAssetById(id);
        if (asset != null) {
            return ResponseEntity.ok(asset);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Asset>> getAssetsByType(@PathVariable String type) {
        return ResponseEntity.ok(assetService.getAssetsByType(type));
    }

    @PostMapping
    public ResponseEntity<?> addAsset(@RequestBody Asset asset) {
        boolean success = assetService.addAsset(asset);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Asset added successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add asset");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable int id, @RequestBody Asset asset) {
        boolean success = assetService.updateAsset(id, asset);
        if (success) {
            return ResponseEntity.ok("Asset updated successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update asset");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable int id) {
        boolean success = assetService.deleteAsset(id);
        if (success) {
            return ResponseEntity.ok("Asset deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete asset");
    }
}
