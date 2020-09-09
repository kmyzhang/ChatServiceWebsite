import React, {Component} from 'react';
import {Form, FormGroup, Row, Col, FormControl, Button} from 'react-bootstrap';
import './SignIn.css';

class SignIn extends Component {
   constructor(props) {
      super(props); // proper is given from the parent

      // Current login state
      this.state = { //state is something you maintain
         email: 'adm@11.com',
         password: 'password'
      }

       // bind 'this' to the correct context
       this.handleChange = this.handleChange.bind(this); //this locks the context object in 
       this.signIn = this.signIn.bind(this);
   }

   // Call redux actionCreator signin via props.
   signIn(event) {
      console.log("Component signin with " + this.state);
      this.props.signIn(this.state, () => this.props.history.push("/allCnv"));
      event.preventDefault()
   }

   // Continually update state as letters typed. Rerenders, but no DOM change!
   handleChange(event) {
      const newState = {}
      newState[event.target.name] = event.target.value;
      this.setState(newState);
   }

   render() {
      console.log("Rendering Signin");
      return ( //you are returning an expression
         <section className="container">
            <Col sm={{offset: 2}}> //when you capitalize, you are saying to create a new React component
               <h1>Sign in</h1>
            </Col>
            <Form>
               <FormGroup as={Row} controlId="formHorizontalEmail">
                  <Col as={Form.Label} sm={2}>
                     Email
                  </Col>
                  <Col sm={8}>
                     <FormControl
                      type="email"
                      name="Email"
                      placeholder="Email"
                      value={this.state.email}
                      onChange={this.handleChange}
                      />
                  </Col>
               </FormGroup>
               <FormGroup as={Row} controlId="formHorizontalPassword">
                  <Col as={Form.Label} sm={2}>
                     Password
                  </Col>
                  <Col sm={8}>
                     <FormControl
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={this.state.password}
                      onChange={this.handleChange}
                     />
                  </Col>
               </FormGroup>
               <FormGroup>
                  <Col>
                     <Button type="submit" onClick={this.signIn}>
                        Sign in
                     </Button>
                 </Col>
               </FormGroup>
            </Form>
         </section>
      )
   }
}

export default SignIn;
