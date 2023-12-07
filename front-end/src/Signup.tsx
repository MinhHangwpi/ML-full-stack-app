import React, {useState} from "react";
import Userpool from "./Userpool";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { Avatar, TextField, Button, Typography, Link, Paper, Grid} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { Navigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displaymessage, setDisplayMessage] = useState("");
    const [isSignedup, setIsSignedup] = useState(false);
    

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const userAttributes=[
            new CognitoUserAttribute({Name: 'email', Value: email})
        ];

        Userpool.signUp(email, password, userAttributes, [], (err, data) => {
            
            if (err){
                console.error(err);
                setDisplayMessage(err.message);
            }
            else{
                setIsSignedup(true);
                setDisplayMessage("Signup successful!"); 
            }
            console.log(data);
            
        });
    };

    if (isSignedup) {
        return <Navigate to="/home" />;
      }

    return (
        <Paper elevation={3} style={{ padding: "10px",
        paddingBottom: "50px",
        height: "50vh",
        width: 350,
        margin: "20px auto",}}>
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
            <h2>Sign Up</h2>
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
              Sign Up
            </Button>
          </Grid>
          <Grid item>
            <Typography style={{color: 'red'}}> {displaymessage && <p>{displaymessage}</p>} </Typography>
            <Typography> Already have an account? <Link href="/">Sign In</Link> </Typography>
            
          </Grid>
            </Grid>
        </form>
    </Paper>
    );
}

export default Signup;