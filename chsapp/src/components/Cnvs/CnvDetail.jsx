import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import {ListGroup, Button} from 'react-bootstrap';
import MsgModal from './MsgModal';
import './CnvDetail.css';
import MsgItem from './../Msgs/MsgItem'


export default props => {
   console.log("Rendering CnvDetail"); 
   const [showMsgModal, setMsgModal] = useState(false);

   let cnvId = props.computedMatch.params.id;

   useEffect(() => {
      props.updateMsgs(cnvId);
   }, []);

   // Open a model with a |cnv| (optional)
   let openMsgModal = () => {
      setMsgModal(true);
   }

   let closeMsgModal = (result) => {
      if (result.status === "Ok") 
         props.addMsg(cnvId, {content: result.content});
      setMsgModal(false);
   }

   let addLike = (res) => {
      props.addLike(res, () => props.updateMsgs(cnvId));
   }

   return (
      <section className="container">
         <h1>
            {useSelector(state => state.Cnvs).find(cnv => cnv.id == cnvId)
             .title}
         </h1>
         <ListGroup>
            {props.Msgs.map((msg, i) => {
               return <MsgItem
                  key={msg.id} 
                  id = {msg.id}
                  email={msg.email}
                  whenMade = {msg.whenMade}
                  numLikes = {msg.numLikes}
                  content = {msg.content}
                  parentProp = {props}
                  addLike = {res => addLike(res)}
                  cnvId = {cnvId}/>
            })}
         </ListGroup>
         <Button className="mt-2" variant="primary" onClick=
            {() => openMsgModal()}>New Message</Button>
         {/* Modal for creating and change cnv */}
         <MsgModal
            showModal={showMsgModal}
            title={"Enter New Message"}
            onDismiss={answer => closeMsgModal(answer)}
            showContent={true} />
      </section>
   )
}




