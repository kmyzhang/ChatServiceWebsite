import React, {useState, useEffect} from 'react';
import { useSelector } from "react-redux";
import {Link} from 'react-router-dom';
import {ListGroup, ListGroupItem, Col, Row, Button} from 'react-bootstrap';
import CnvModal from './CnvModal';
import {ConfDialog} from '../components';
import './CnvOverview.css';
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default props => {
   console.log("Rendering CnvOverview");
   const [showDelModal, setDelModal] = useState(false);
   const [showCnvModal, setCnvModal] = useState(false);
   const [delCnv, setDelCnv] = useState(null);
   const [editCnv, setEditCnv] = useState(null);

   useEffect(() => {
      props.updateCnvs();
   }, []);

   let openCnvModal = (cnv) => {
      setCnvModal(true);
      setEditCnv(cnv);
   }

   let closeCnvModal = result => {
      if (result.status === "Ok") {
         editCnv ? props.modCnv(editCnv.id, result.title, 
          () => props.updateCnvs()) : props.addCnv({title: result.title});
      }
      setCnvModal(false);
      setEditCnv(null);
   }

   let openDelConfirm = cnv => {
      setDelModal(true);
      setDelCnv(cnv);
   }

   let closeDelConfirm = result => {
      if (result === "Yes") {
         props.delCnv(delCnv.id);
      }
      setDelModal(false);
      setDelCnv(null);
   }

   const CnvItem = function (props) {
      return (
         <ListGroupItem>
            <Row> 
               <Col sm={4}>
                  <div className="float-left pt-1">
                     <Link to={`/CnvDetail/${props.id}`}>{props.title}</Link>
                  </div>
               </Col>
               <Col sm={4}> 
                  <div className="float-left pt-1">
                     {props.lastMessage ? new Intl.DateTimeFormat('us',
                      {
                         year: "numeric", month: "short", day: "numeric",
                         hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })
                      .format(new Date(props.lastMessage)) : "N/A"}
                  </div>
               </Col>
               <Col sm={4}> {props.showControls ?
                  <div className="float-right">
                     <Button className="m-1" size="sm" onClick={props.onDelete}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                     </Button>
                     <Button size="sm" onClick={props.onEdit}>
                     <FontAwesomeIcon icon={faEdit} />
                     </Button>
                  </div>
                  : ''}
               </Col>
            </Row>
         </ListGroupItem>
      )
   }

   return (
      <section className="container">
         <h1>Cnv Overview</h1>
            <ListGroup>
               { useSelector(state => state.Cnvs).map(cnv => {
                  if (!props.userOnly || props.Prss.id === cnv.ownerId)
                     return <CnvItem
                      key={cnv.id} 
                      showControls={cnv.ownerId === props.Prss.id || 
                      props.Prss.role === 1}
                      onDelete={() => openDelConfirm(cnv)}
                      onEdit={() => openCnvModal(cnv)} 
                      lastMessage = {cnv.lastMessage}
                      title = {cnv.title}
                      id = {cnv.id}/>;
               })}
            </ListGroup>
         <Button className="mt-2" variant="primary" onClick=
            {() => openCnvModal()}>New Conversation</Button>
         <CnvModal
            showModal={showCnvModal}
            title={editCnv ? "Edit title" : "New Conversation"}
            cnv={editCnv}
            onDismiss={answer => closeCnvModal(answer)} />
         <ConfDialog
            show={showDelModal}
            title="Delete Conversation"
            body={`Are you sure you want to delete the Conversation
             '${delCnv ? delCnv.title : ''}'`}
            buttons={['Yes', 'Abort']}
            onClose={answer => closeDelConfirm(answer)}/>
      </section>
   )
}




