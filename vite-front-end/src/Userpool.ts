import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-2_QPgP04KTv",
    ClientId: "54d3q35040rlqjpq7cr9k67cd3"
}

export default new CognitoUserPool(poolData);