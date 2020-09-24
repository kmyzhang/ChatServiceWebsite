import React, {Component} from 'react';
import {Form, FormGroup, Row, Col, FormControl, Button} from 'react-bootstrap';
import './SignIn.css';

class SignIn extends Component {
   constructor(props) {
      super(props);

      this.state = { 
         email: '',
         password: ''
      }

      this.handleChange = this.handleChange.bind(this); 
      this.signIn = this.signIn.bind(this);
   }

   // Call redux actionCreator signin via props.
   signIn(event) {
      console.log("Component signin with " + this.state);
      this.props.signIn(this.state, () => this.props.history.push("/allCnvs"));
      event.preventDefault();
   }

   // Continually update state as letters typed. Rerenders, but no DOM change!
   handleChange(event) {
      const newState = {}
      newState[event.target.name] = event.target.value;
      this.setState(newState);
   }

   render() {
      return (
         <div className="wrapper">
            <div className="form-wrapper">
               <Form>
                  <h1 className="text-center">Welcome!</h1>
                  <FormGroup as={Row} controlId="formBasicEmail">
                     <Form.Label>Email address</Form.Label>
                     <FormControl
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup as={Row} controlId="formBasicPassword">
                     <Form.Label>Password</Form.Label>
                     <FormControl
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.handleChange}/>
                  </FormGroup>
                  <div className="createAccount">
                     <Button variant="dark" type="submit" onClick={this.signIn}>
                        Sign in
                     </Button>
                  </div>
               </Form>
            </div>
         </div>
      )
   }
}

export default SignIn;
