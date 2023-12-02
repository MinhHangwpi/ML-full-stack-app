"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLandmarkData = void 0;
const axios_1 = __importDefault(require("axios"));
const handleLandmarkData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flaskServerURL = 'http://flask_app:5000/endpoint'; // Or the appropriate URL
        const response = yield axios_1.default.post(flaskServerURL, req.body);
        if (response.status === 200) {
            res.json(response.data);
        }
        else {
            console.error('Flask server response with status:', response.status);
            res.status(response.status).json({
                message: `Flask server responded with status ${response.status}`
            });
        }
    }
    catch (error) {
        console.error('Error forwarding data:', error);
        res.status(500).json({ message: 'Error forwarding data to Flask server' });
    }
});
exports.handleLandmarkData = handleLandmarkData;
