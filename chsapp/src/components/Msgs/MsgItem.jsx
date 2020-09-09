import React, { Component } from 'react';
import {ListGroup, ListGroupItem, Col, Row, Button, 
 Collapse} from 'react-bootstrap';
import Popup from "reactjs-popup";

export default class MsgItem extends Component {
   constructor(props) {
      super(props);
   
      this.state = {
         collapse: false,
         popup: false,
         loaded: false
      }
   }

   toggle = () => {
      this.setState({collapse: !this.state.collapse})
   }

   loadLikes = () => {
      this.props.parentProp.loadLikes(this.props.id)
   }

   loadLikesList = () => {
      if (this.props.parentProp.Likes[this.props.id] && 
       this.props.parentProp.Likes[this.props.id].length) {
         return this.props.parentProp.Likes[this.props.id].map(like => {
         return ( <ListGroupItem key={like.id}> 
          {like.firstName + " "+ like.lastName}
          </ListGroupItem> );
      })}
   }

   render() {
      return (
         <ListGroupItem>
            <Row> 
               <Col sm={4}>
                  <div className="float-left" onClick={this.toggle}>
                     {this.props.email}
                  </div>
               </Col>
               <Col sm={4}> {this.props.whenMade ? new Intl.DateTimeFormat('us',
                  {
                     year: "numeric", month: "short", day: "numeric",
                     hour: "2-digit", minute: "2-digit", second: "2-digit"
                  })
                  .format(new Date(this.props.whenMade)) : "N/A"}
               </Col>
               <Col sm={4}>
                  <div onMouseEnter={this.loadLikes}>
                     <Popup trigger={<div className="d-inline-flex col-example" 
                      onClick={() => this.props.addLike(this.props.id)}>
                      {this.props.numLikes} likes</div>} on="hover">
                        <ListGroup>
                           {this.loadLikesList()}
                        </ListGroup>
                     </Popup>  
                  </div>  
               </Col>
            </Row>
            <Collapse in={this.state.collapse}>
               <div>
                  <p>{this.props.content}</p>
               </div>
            </Collapse>
         </ListGroupItem>
      )
   }
}
