"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const landmark_controllers_1 = require("../controllers/landmark.controllers");
const router = express_1.default.Router();
router.post('/', landmark_controllers_1.handleLandmarkData);
exports.default = router;
