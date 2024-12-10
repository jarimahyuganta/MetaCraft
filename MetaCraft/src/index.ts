import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * StableBTreeMap digunakan untuk menyimpan data aset 3D dan desain virtual.
 * - Key: ID aset (string)
 * - Value: Informasi aset virtual (Asset)
 */

class Asset {
  id: string;
  name: string;
  creator: string;
  description: string;
  assetURL: string;
  price: number;
  createdAt: Date;
  updatedAt: Date | null;
}

const assetStorage = StableBTreeMap<string, Asset>(0);

const app = express();
app.use(express.json());

// Tambahkan aset 3D baru
app.post("/assets", (req, res) => {
  const asset: Asset = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    ...req.body,
  };
  assetStorage.insert(asset.id, asset);
  res.json(asset);
});

// Tampilkan semua aset
app.get("/assets", (req, res) => {
  res.json(assetStorage.values());
});

// Tampilkan detail aset berdasarkan ID
app.get("/assets/:id", (req, res) => {
  const assetId = req.params.id;
  const assetOpt = assetStorage.get(assetId);
  if (!assetOpt) {
    res.status(404).send(`Asset with id=${assetId} not found`);
  } else {
    res.json(assetOpt);
  }
});

// Perbarui informasi aset
app.put("/assets/:id", (req, res) => {
  const assetId = req.params.id;
  const assetOpt = assetStorage.get(assetId);
  if (!assetOpt) {
    res.status(400).send(`Couldn't update asset with id=${assetId}. Asset not found`);
  } else {
    const updatedAsset = {
      ...assetOpt,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    assetStorage.insert(assetId, updatedAsset);
    res.json(updatedAsset);
  }
});

// Hapus aset
app.delete("/assets/:id", (req, res) => {
  const assetId = req.params.id;
  const deletedAsset = assetStorage.remove(assetId);
  if (!deletedAsset) {
    res.status(400).send(`Couldn't delete asset with id=${assetId}. Asset not found`);
  } else {
    res.json(deletedAsset);
  }
});

app.listen();

function getCurrentDate() {
  const timestamp = Number(time());
  return new Date(timestamp.valueOf() / 1_000_000);
}
