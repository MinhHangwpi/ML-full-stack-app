"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// running application on port, or set up db connection
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
app_1.default.listen(config_1.API_PORT, () => {
    console.log(`Server running on port ${config_1.API_PORT} of the ${config_1.NODE_ENV} environment`);
});
