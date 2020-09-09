import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {ListGroup, ListGroupItem, Col, Row, Button} from 'react-bootstrap';
import CnvModal from './CnvModal';
import {ConfDialog} from '../components';
import {delCnv} from '../../api';
import './CnvOverview.css';

export default class CnvOverview extends Component {
   constructor(props) {
      super(props);

      this.props.updateCnvs();
      this.state = {
         showModal: false,
         showConfirmation: false,
      }
   }

   // Open a model with a |cnv| (optional)
   openModal = (cnv) => {
      this.state.showModal = true;
      this.state.cnv = cnv; //THIS IS A BUG you must use "setSate"
   }

   modalDismiss = (result) => {
      if (result.status === "OK") {
         if (this.state.editCnv)
            this.modCnv(result);
         else
            this.newCnv(result);
      }
      this.setState({ showModal: false, editCnv: null });
   }

   modCnv(result) {
      this.props.modCnv(this.state.editCnv, result.cnvTitle);
   }

   newCnv(result) {
      this.props.addCnv({ title: result.cnvTitle });
   }

   openConfirmation = (cnv) => {
      this.setState({ delCnv: cnv, showConfirmation: true })
   }

   closeConfirmation = (res) => {
      this.state.showConfirmation = false;
   }

   render() {
      console.log("Rerendering Cnv Overview ", this.props);
      var cnvItems = [];

      this.props.Cnvs.forEach(cnv => {
         if (!this.props.userOnly || this.props.Prss.id === cnv.ownerId)
            cnvItems.push(<CnvItem
               key={cnv.id} 
               showControls={cnv.ownerId === this.props.Prss.id}
               onDelete={() => this.openConfirmation(cnv)}
               onEdit={() => this.openModal(cnv)} />);
      });

      return (
         <section className="container">
            <h1>Cnv Overview</h1>
            <ListGroup>
               {cnvItems}
            </ListGroup>
            <Button variant="primary" onClick=
               {function() {this.openModal()}}>New Conversation</Button>
            {/* Modal for creating and change cnv */}
            <CnvModal
               showModal={this.state.showModal}
               title={this.state.editCnv ? "Edit title" : "New Conversation"}
               cnv={this.state.editCnv}
               onDismiss={this.modalDismiss} />
            <ConfDialog
               show={this.state.showConfirmation}
               title="Delete Conversation"
               body={`Are you sure you want to delete the Conversation
           '${this.state.delCnv ? this.state.delCnv.title : ''}'`}
               buttons={['Yes', 'Abort']}
               onClose={this.closeConfirmation} />
         </section>
      )
   }
}

// A Cnv list item
const CnvItem = function (props) {
   return (
      <ListGroupItem>
         <Row> 
            <Col sm={4}>
               <Link to={"/CnvDetail/" + props.id}>{props.title}</Link>
            </Col>
            <Col sm={4}>{new Intl.DateTimeFormat('us',
               {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
               })
               .format(new Date(props.lastMessage))}
            </Col>
            {props.showControls ?
               <div className="float-right">
                  <Button size="sm" onClick={props.onDelete}>
                     <span class="fa fa-thumbs-up"/>
                  </Button>
                  <Button size="sm" onClick={props.onEdit}>
                     <span class="fa fa-edit"/>
                  </Button>
               </div>
               : ''}
         </Row>
      </ListGroupItem>
   )
}
