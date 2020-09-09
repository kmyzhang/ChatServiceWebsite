import React, { useState } from 'react';
import {ConfDialog} from '../components';
import {Form, FormGroup, FormControl, Button, Alert} from 'react-bootstrap';

import './Register.css';

// Functional component label plus control w/optional help message
function FieldGroup({id, label, help, ...otherProps }) {
   return ( 
      <FormGroup controlId={id}>
         <Form.Label>{label}</Form.Label>
         <Form.Control {...otherProps} />
         {help && <Form.Text className="text-muted">{help}</Form.Text>}
      </FormGroup>
   );
}

export default props => {
   console.log("Rendering Registration"); 
   const[fName, setFN] = useState('');
   const[lName, setLN] = useState('');
   const[em, setE] = useState('');
   const[pass, setP] = useState('');
   const[passTwo, setP2] = useState('');
   const[termsAccept, setT] = useState(false);
   const[rol, setR] = useState(0);
   const[offerSignIn, setU] = useState(false);

   let submit =  () => {
      let firstName = fName;
      let lastName = lName;
      let email = em;
      let password = pass;
      let termsAccepted = termsAccept;
      let role = rol;

      const user = {
         firstName,
         lastName,
         email,
         password,
         termsAccepted,
         role
      };

      props.register(user, () => setU(true));
   }

   let handleChange = ev => {
      switch (ev.target.id) {
      case 'termsAccepted':
         setT(ev.target.checked);
         break;
      case 'email':
         setE(ev.target.value);
         break;
      case 'firstName':
         setFN(ev.target.value);
         break;
      case 'lastName':
         setLN(ev.target.value);
         break;
      case 'password':
         setP(ev.target.value);
         break;
      case 'passwordTwo':
         setP2(ev.target.value);
         break;
      default:
         setT(ev.target.value);
      }
   }

   function formValid() {
      return em && lName && pass && pass === passTwo && termsAccept;
   }

   return (
      <div className="container">
         <form>
            <FieldGroup id="email" type="email" label="Email Address"
             placeholder="Enter email" value={em}
             onChange={handleChange} required={true}
             />

            <FieldGroup id="firstName" type="text" label="First Name"
             placeholder="Enter first name" value={fName}
             onChange={handleChange}
             />

            <FieldGroup id="lastName" type="text" label="Last Name"
             placeholder="Enter last name" value={lName}
             onChange={handleChange} required={true}
             />

            <FieldGroup id="password" type="password" label="Password"
             value={pass}
             onChange={handleChange} required={true}
             />

            <FieldGroup id="passwordTwo" type="password" label="Repeat Password"
             value={passTwo}
             onChange={handleChange} required={true}
             help="Repeat your password"
            />

            <Form.Check  id="termsAccepted"
             value={termsAccept} onChange={handleChange}
             label="Do you accept the terms and conditions?"/>
         </form>

         {pass !== passTwo ?
          <Alert variant="warning">
             Passwords don't match
          </Alert> : ''}

         <Button variant="primary" onClick={() => submit()} 
          disabled={!formValid()}>
            Submit
         </Button>

         <ConfDialog
            show={offerSignIn}
            title="Registration Success"
            body={`Would you like to log in as ${em}?`}
            buttons={['YES', 'NO']}
            onClose={answer => {
               setU(false);
               if (answer === 'YES') {
                  props.signIn(
                   {email: em, password: pass},
                   () => props.history.push("/"));
               }
            }}
         />
      </div>
   )
}
