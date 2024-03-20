// import { Button, Offcanvas, Stack } from "react-bootstrap";
// import { useShoppingCart } from "../context/ShoppingCartContext";
// import { formatCurrency } from "../utilities/formatCurrency";
// import { CartItem } from "./CartItem";
// import storeItems from "../data/items.json";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
// } from "@chakra-ui/react";

// type ShoppingCartProps = {
//   isOpen: boolean;
// };

// export function ShoppingCart({ isOpen }: ShoppingCartProps) {
//   const { closeCart, cartItems } = useShoppingCart();
//   const { isOpen: isOpened, onOpen, onClose } = useDisclosure();
//   return (
//     <Offcanvas show={isOpen} onHide={closeCart} placement="end">
//       <Offcanvas.Header closeButton>
//         <Offcanvas.Title>Cart</Offcanvas.Title>
//       </Offcanvas.Header>
//       <Offcanvas.Body>
//         <Stack gap={3}>
//           {cartItems.map((item) => (
//             <CartItem key={item.id} {...item} />
//           ))}
//           <div className="ms-auto fw-bold fs-5">
//             Total{" "}
//             {formatCurrency(
//               cartItems.reduce((total, cartItem) => {
//                 const item = storeItems.find((i) => i.id === cartItem.id);
//                 return total + (item?.price || 0) * cartItem.quantity;
//               }, 0)
//             )}
//           </div>
//           <>
//             <Button onClick={onOpen}>Purchase</Button>

//             <Modal isOpen={isOpened} onClose={onClose}>
//               <ModalOverlay>
//                 <ModalContent>
//                   <ModalHeader></ModalHeader>
//                   <ModalCloseButton />

//                   <ModalBody className="center">
//                     Do you want to confirm purchase?
//                   </ModalBody>

//                   <ModalFooter>
//                     <Button onClick={() => {}}>Yes</Button>
//                     <Button onClick={onClose} variant="ghost">
//                       No
//                     </Button>
//                   </ModalFooter>
//                 </ModalContent>
//               </ModalOverlay>
//             </Modal>
//           </>
//         </Stack>
//       </Offcanvas.Body>
//     </Offcanvas>
//   );
// }

import React from "react";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { formatCurrency } from "../utilities/formatCurrency";
import { CartItem } from "./CartItem";
import storeItems from "../data/items.json";
import Modal from "./Modal";
import Drawer from "@mui/material/Drawer";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

type ShoppingCartProps = {
  isOpen: boolean;
};

export function ShoppingCart({ isOpen }: ShoppingCartProps) {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const { cartItems } = useShoppingCart();
  return (
    <Drawer open={open} onClose={toggleDrawer(false)}>
      <Stack gap={3}>
        {cartItems.map((item) => (
          <CartItem key={item.id} {...item} />
        ))}
        <div className="ms-auto fw-bold fs-5">
          Total{" "}
          {formatCurrency(
            cartItems.reduce((total, cartItem) => {
              const item = storeItems.find((i) => i.id === cartItem.id);
              return total + (item?.price || 0) * cartItem.quantity;
            }, 0)
          )}
        </div>
      </Stack>
    </Drawer>
  );
}
// const ShoppingCart: React.FC<ShoppingCartProps> = () => {
//   return <div>Have a good coding</div>;
// };
// export default ShoppingCart;
