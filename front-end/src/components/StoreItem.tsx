// import { Button, Card } from "react-bootstrap";
// import { useShoppingCart } from "../context/ShoppingCartContext";
// import { formatCurrency } from "../utilities/formatCurrency";
// type StoreItemProps = {
//   id: number;
//   name: string;
//   price: number;
//   imgUrl: string;
// };

// export function StoreItem({ id, name, price, imgUrl }: StoreItemProps) {
//   const {
//     getItemQuantity,
//     increaseCartQuantity,
//     // decreaseCartQuantity,
//     removeFromCart,
//   } = useShoppingCart();
//   const quantity = getItemQuantity(id);

//   return (
//     <Card className="h-100">
//       <Card.Img
//         variant="top"
//         src={imgUrl}
//         height="200px"
//         style={{ objectFit: "cover" }}
//       />
//       <Card.Body className="d-flex flex-column">
//         <Card.Title className="d-flex justify-content-between align-items-baseline mb-4">
//           <span className="fs-2">{name}</span>
//           <span className="ms-2 text-muted">{formatCurrency(price)}</span>
//         </Card.Title>
//         <div className="mt-auto">
//           {quantity === 0 ? (
//             <div className="card">
//               <Button
//                 className="w-100"
//                 onClick={() => increaseCartQuantity(id)}
//               >
//                 Purchase
//               </Button>
//             </div>
//           ) : (
//             <div
//               className="d-flex align-items-center flex-column"
//               style={{ gap: ".5rem" }}
//             >
//               <div
//                 className="d-flex align-items-center justify-content-center"
//                 style={{ gap: ".5rem" }}
//               >
//                 {/* <Button onClick={() => decreaseCartQuantity(id)}>-</Button> */}
//                 <div>
//                   {/* <span className="fs-3">{quantity}</span> in cart */}
//                 </div>
//                 {/* <Button onClick={() => increaseCartQuantity(id)}>+</Button> */}
//               </div>
//               <Button
//                 onClick={() => removeFromCart(id)}
//                 variant="danger"
//                 size="sm"
//               >
//                 Remove
//               </Button>
//             </div>
//           )}
//         </div>
//       </Card.Body>
//     </Card>
//   );
// }

import React from "react";
import { formatCurrency } from "../utilities/formatCurrency";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { Card, Button, Typography, Grid, Dialog, Box } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Modal from "@mui/material/Modal";

type StoreItemProps = {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
};

export function StoreItem({ id, name, price, imgUrl }: StoreItemProps) {
  const {
    // getItemQuantity,
    increaseCartQuantity,
    // decreaseCartQuantity,
    removeFromCart,
  } = useShoppingCart();

  const styles = {
    media: {
      height: "auto",
      padding: "40px",
    },
  };
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const quantity = getItemQuantity(id);

  return (
    <Grid>
      <Card>
        <CardMedia
          src={imgUrl}
          height="200px"
          component="img"
          style={styles.media}
        />
        <CardContent className="d-flex flex-column">
          <Typography className="d-flex justify-content-between align-items-baseline mb-4">
            <span className="fs-2 font-jakarta-sans text-xl">{name}</span>
            <div>
              <p className="font-jakarta-sans text-xl">
                <span className="ms-2 text-muted">{formatCurrency(price)}</span>
                <Button
                  onClick={handleOpen}
                  variant="contained"
                  className="font-jakarta-sans bg-primary hover:bg-blue-500 duration-300 float-right"
                >
                  Purchase
                </Button>
              </p>
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Typography
                    className="font-jakarta-sans text-xl"
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Do you want to confirm purchase?
                  </Typography>
                  <Button className="w-100 font-jakarta-sans hover:bg-blue-500 duration-300">
                    Yes
                  </Button>
                  <Button className="w-100 font-jakarta-sans hover:bg-blue-500 duration-300">
                    No
                  </Button>
                </Box>
              </Modal>
            </div>
          </Typography>
          <div className="mt-auto">
            {/* {quantity === 0 ? (
            <div className="card">
              <Button
                className="w-100"
                onClick={() => increaseCartQuantity(id)}
              >
                Purchase
              </Button>
            </div>
          ) : ( */}
            <div
              className="d-flex align-items-center flex-column"
              style={{ gap: ".5rem" }}
            >
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ gap: ".5rem" }}
              >
                {/* <Button onClick={() => decreaseCartQuantity(id)}>-</Button> */}
                <div>
                  {/* <span className="fs-3">{quantity}</span> in cart */}
                </div>
                {/* <Button onClick={() => increaseCartQuantity(id)}>+</Button> */}
              </div>
              {/* <Button onClick={() => removeFromCart(id)}>Remove</Button> */}
            </div>
            {/* )} */}
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
}

// const StoreItem: React.FC<StoreItemProps> = () => {
//   return <div>Have a good coding</div>;
// };
// export default StoreItem;
