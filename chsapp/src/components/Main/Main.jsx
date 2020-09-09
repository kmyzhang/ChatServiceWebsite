import React, { Component } from 'react';
import {Register, SignIn, CnvOverview, CnvDetail } from '../components'
import {Route, Redirect, Switch } from 'react-router-dom';
import {Navbar, Nav, Modal, Button, Alert, Container, Row,
 Col} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import './Main.css';

const statusPadding = 60;
const s = 3;

var ProtectedRoute = ({component: Cmp, path, ...rest }) => {
   return (<Route path={path} render={(props) => {
      return Object.keys(rest.Prss).length !== 0 ?
       <Cmp {...rest}/> : <Redirect to='/signin'/>;}}/>);
   };
   
class Main extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showModal: false
      }
   }

   showModal = () => {
      if (Object.keys(this.props.Errs).length != 0) {
         this.setState({ showModal: true });
      }
   };
  
   hideModal = () => {
      this.props.clearErrors();
   };

   signedIn() {
      return Object.keys(this.props.Prss).length !== 0;
   }

   render() {
      return (
         <div>
            <div>
               <Navbar expand="lg" className="justify-content-between">
                  <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                  <Navbar.Collapse>
                     <Nav id="basic-navbar-nav" variant="pills" 
                      activeKey={null}>
                        {this.signedIn() ?
                           [
                              <LinkContainer key={0} to='/allCnvs'>
                                 <Nav.Link> All Conversations</Nav.Link>
                              </LinkContainer>,
                              <LinkContainer key={1} to='/myCnvs'>
                                 <Nav.Link>My Conversations</Nav.Link>
                              </LinkContainer>
                           ]
                           :
                           [
                              <LinkContainer key={0} to='/signin'>
                                 <Nav.Link>Sign In</Nav.Link>
                              </LinkContainer>,
                              <LinkContainer key={1} to='/register'>
                                 <Nav.Link>Register</Nav.Link>
                              </LinkContainer>
                           ]
                        }
                     </Nav>
                  </Navbar.Collapse>
                  <Navbar.Collapse>
                     {this.signedIn() ?
                        [
                           <Nav.Item key={s} className="ml-auto" onClick={() => 
                            this.props.signOut(() => this.props.history
                            .push("/allCnvs"))}>
                              Sign out
                           </Nav.Item>   
                        ]
                        :
                        ''
                     }
                  </Navbar.Collapse>
               </Navbar>
               <Container style={{ paddingRight: statusPadding }}>
                  <Row>
                     {this.signedIn() ?
                        [
                           
                           <Col key={s}>
                              <Nav.Item className="float-right">
                              {`Logged in as: ${this.props.Prss.firstName}
                                 ${this.props.Prss.lastName}`}
                              </Nav.Item> 
                           </Col>
                        ]
                        :
                        ''
                     }  
                  </Row>
               </Container>
            </div>

            {/*Alternate pages beneath navbar, based on current route*/}
            <Switch>
               <Route exact path='/'
                  component={() => this.props.Prss ? <Redirect to="/allCnvs" />
                   : <Redirect to="/signin" />} />
               <Route path='/signin' render={() => <SignIn 
                {...this.props} />} />
               <Route path='/register' render={() => <Register 
                {...this.props} />} />
               <ProtectedRoute path='/allCnvs' component={CnvOverview}
                {...this.props}/>
               <ProtectedRoute path='/myCnvs' component={CnvOverview}
                userOnly={true} {...this.props}/>
               <ProtectedRoute path='/CnvDetail/:id' component={CnvDetail}
                {...this.props}/>
            </Switch>

            {/*Error popup dialog*/}
            <Modal show={this.props.Errs.length !== 0} onHide={this.hideModal}>
               <Modal.Header closeButton>
                  <Modal.Title>Error Notice</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  <Alert className="border" color="primary">
                     {this.props.Errs}
                  </Alert>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="primary" onClick={this.hideModal}>
                     OK
                  </Button>
               </Modal.Footer>
            </Modal>
         </div>
      )
   }
}

export default Main
