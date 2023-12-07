import React, { useState } from "react";
import Userpool from "./Userpool";
import {
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { Navigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import "./App.css";
import Signup from "./Signup";
import { Avatar, TextField, Button, Typography, Link, Paper, Grid} from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displaymessage, setDisplayMessage] = useState("");

  const [checked, setChecked] = useState(true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: Userpool,
    });

    const userAttributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log("onSuccess:", data);
        setIsLoggedIn(true);
      },
      onFailure: (err) => {
        console.log("onFailure: ", err);
        setDisplayMessage(err.message);
      },
      newPasswordRequired: (data) => {
        console.log("newPasswordRequired: ", data);
      },
    });
  };

  if (isLoggedIn) {
    return <Navigate to="/home" />;
  }

  return (
    <Paper
      elevation={10}
      style={{
        padding: "10px",
        paddingBottom: "50px",
        height: "50vh",
        width: 350,
        margin: "20px auto",
      }}
    >
      <form onSubmit={onSubmit}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
          spacing={2}
        >
          <Grid item>
            <Avatar>
              <LockIcon />
            </Avatar>
          </Grid>
          <Grid item>
            <h2>Sign In</h2>
          </Grid>
          <Grid item>
            <TextField
              label="Email"
              placeholder="Enter Email Address"
              fullWidth
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Password"
              type="password"
              placeholder="Enter Password"
              fullWidth
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Grid>
          <Grid item>
            <Button type="submit" color="primary" variant="contained" fullWidth>
              Sign In
            </Button>
          </Grid>
          <Grid item>
            <Typography style={{color: 'red'}}> {displaymessage && <p>{displaymessage}</p>}  </Typography>
            <Typography>
              {" "}
              Do you have an account?
              <Link href="/signup">Sign Up</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default Login;
