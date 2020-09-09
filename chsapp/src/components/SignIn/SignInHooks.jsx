import React, {useState} from 'react';
import {Form, FormGroup, Row, Col, FormControl, Button} from 'react-bootstrap';
import './SignIn.css';

export default props => {
   const [creds, setCreds] = useState({ //setCreds is a replacement for setState
      email: 'adm@11.com',
      password: 'password'
   });

   let handleChange = event => {
      creds[event.target.name] = event.target.value;
      setCreds(creds);
   }

   let signIn = event => {
      props.signIn(creds, () => {
         props.updateCnvs();
         props.history.push("/allCnvs");
      });
      event.preventDefault()
   }

   return (
      <section className="container">
         <Col sm={{offset: 2}}>
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
                     value={creds.email}
                     onChange={handleChange}
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
                     value={creds.password}
                     onChange={handleChange}
                  />
               </Col>
            </FormGroup>
            <FormGroup>
               <Col>
                  <Button type="submit" onClick={signIn}>
                     Sign in
                  </Button>
               </Col>
            </FormGroup>
         </Form>
      </section>
   )
}

//turn component to function
//replace stte with useState calls
//replace setState with setCall from useStat
//make member functions into simple functions
//alter return so it's no longer a render function but jsut a return
//hunt and replace for "this."
//change this.prop to local variables






class Register extends Component {
   constructor(props) {
      super(props);
      this.state = {
         firstName: '',
         lastName: '',
         email: '',
         password: '',
         passwordTwo: '',
         termsAccepted: false,
         role: 0,
         offerSignIn: false
      }
      this.handleChange = this.handleChange.bind(this);
   }

   submit() {
      let { // Make a copy of the relevant values in current state
         firstName,
         lastName,
         email,
         password,
         termsAccepted,
         role
      } = this.state;

      const user = {
         firstName,
         lastName,
         email,
         password,
         termsAccepted,
         role
      };

      this.props.register(user, () => {this.setState({offerSignIn: true})});
   }

   handleChange(ev) {
      let newState = {};

      switch (ev.target.type) {
      case 'checkbox':
         newState[ev.target.id] = ev.target.checked;
         break;
      default:
         newState[ev.target.id] = ev.target.value;
      }
      this.setState(newState);
   }

   formValid() {
      let s = this.state;

      return s.email && s.lastName && s.password && s.password === s.passwordTwo
       && s.termsAccepted;
   }

   render() {
     return (
        <div className="container">
           <form>
              <FieldGroup id="email" type="email" label="Email Address"
               placeholder="Enter email" value={this.state.email}
               onChange={this.handleChange} required={true}
               />

              <FieldGroup id="firstName" type="text" label="First Name"
               placeholder="Enter first name" value={this.state.firstName}
               onChange={this.handleChange}
               />

              <FieldGroup id="lastName" type="text" label="Last Name"
               placeholder="Enter last name" value={this.state.lastName}
               onChange={this.handleChange} required={true}
               />

              <FieldGroup id="password" type="password" label="Password"
               value={this.state.password}
               onChange={this.handleChange} required={true}
               />

              <FieldGroup id="passwordTwo" type="password" label="Repeat Password"
               value={this.state.passwordTwo}
               onChange={this.handleChange} required={true}
               help="Repeat your password"
              />

              <Form.Check  id="termsAccepted"
               value={this.state.termsAccepted} onChange={this.handleChange}
               label="Do you accept the terms and conditions?"/>
           </form>

           {this.state.password !== this.state.passwordTwo ?
            <Alert variant="warning">
               Passwords don't match
            </Alert> : ''}

           <Button variant="primary" onClick={() => this.submit()} 
            disabled={!this.formValid()}>
              Submit
           </Button>

           <ConfDialog
              show={this.state.offerSignIn}
              title="Registration Success"
              body={`Would you like to log in as ${this.state.email}?`}
              buttons={['YES', 'NO']}
              onClose={answer => {
                 console.log(answer);
                 this.setState({offerSignIn: false});
                 if (answer === 'YES') {
                    this.props.signIn(
                     {email: this.state.email, password: this.state.password},
                     () => this.props.history.push("/"));
                 }
              }}
           />
        </div>
      )
   }
}

export default Register;









export default class CnvDetail extends Component {
   constructor(props) {
      super(props);

      this.cnvId = this.props.computedMatch.params.id;
      this.props.updateMsgs(this.cnvId);

      this.state = {
         showMsgModal: false,
         delCnv: null,
         editCnv: null,
         open: false,
         addTest: false
      }
   }

   // Open a model with a |cnv| (optional)
   openMsgModal = () => {
      this.setState({showMsgModal: true});
   }

   closeMsgModal = (result) => {
      if (result.status === "Ok") 
         this.props.addMsg(this.cnvId, {content: result.content});
      this.setState({showMsgModal: false});
   }

   addLike = (res) => {
      console.log('msgId' + res);
      this.props.addLike(res, () => this.props.updateMsgs(this.cnvId));
   }

   render() {
      var msgItems = [];
      console.log(this.props);
      this.props.Msgs.forEach((msg, i) => {
         console.log("MSGITEMS ARE BEING RE RENDERED");
         console.log(msg);
         msgItems.push(<MsgItem
            key={msg.id} 
            id = {msg.id}
            email={msg.email}
            whenMade = {msg.whenMade}
            numLikes = {msg.numLikes}
            content = {msg.content}
            parentProp = {this.props}
            addLike = {res => this.addLike(res)}
            cnvId = {this.cnvId}/>);
      });

      return (
         <section className="container">
            <h1>{this.props.Cnvs.find(cnv => cnv.id == this.cnvId).title}</h1>
            <ListGroup>
               {msgItems}
            </ListGroup>
            <Button className="mt-2" variant="primary" onClick=
               {() => this.openMsgModal()}>New Message</Button>
            {/* Modal for creating and change cnv */}
            <MsgModal
               showModal={this.state.showMsgModal}
               title={"Enter New Message"}
               onDismiss={answer => {this.closeMsgModal(answer)}}
               showContent={true} />
         </section>
      )
   }
}

/*const MsgItem = function (props) {
   let likeItems = [];

   let state = {
      collapse: false,
      popup: false,
      loaded: false
   }

   let toggle = () => {
      console.log('here');
      state.collapse = !state.collapse;
      console.log(state.collapse);
   }

   let handleStuff = () => {
      if (props.numLikes != 0 && !state.loaded) {
         props.parentProp.loadLikes(props.id, () => props.parentProp.Likes[props.id].forEach(like => {
            likeItems.push(<ListGroupItem>
               {like.firstName} {like.lastName}
            </ListGroupItem> )
         }))
         state.loaded = true;
      }
   }
   
   let addLike = () => {
      console.log('msgItem addLike');
      props.parentProp.addLike(props.id);
   }

   return (
      <ListGroupItem>
         <Row> 
            <Col sm={4}>
               <div className="float-left" onClick={toggle}>
                  {props.email}
               </div>
            </Col>
            <Col sm={4}> {props.whenMade ? new Intl.DateTimeFormat('us',
               {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
               })
               .format(new Date(props.whenMade)) : "N/A"}
            </Col>
            <Col sm={4}>
                <Popup trigger={<text onClick={addLike}>{props.numLikes} likes</text>} on="hover" onOpen={handleStuff}>
                     <ListGroup>
                        {likeItems}
                     </ListGroup>
                </Popup>    
            </Col>
         </Row>
         <div show={state.collapse}>
            <div>
               <p>{props.content}</p>
            </div>
         </div>
      </ListGroupItem>
   )
}*/
