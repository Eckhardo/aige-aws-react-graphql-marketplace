import React from "react";
import {Card} from "element-react";
import {S3Image} from "aws-amplify-react";
import {convertCentsToEuros} from "../utils";
import PayButton from "../components/PayButton";

const ProductCard = (props) => {
    console.log('ProductCard:', props.product);
    return (

        <Card bodyStyle={{padding: 0, minWidth: '200px'}}>
            <S3Image
                imgKey={props.product.file.key}
                theme={{photoImg: {width: '100px', height: '100px'}}}/>
            <div className="card-body">
                <h3 className="m-0">{props.product.description}</h3>
                <div className="item-center">
                    Delivery: {props.product.shipped ? "Shipped" : "Emailed"}
                </div>
                <div className="text-right">
                             <span className="mx-1">
                                 €{convertCentsToEuros(props.product.price)}
                             </span>
                    {props.isProductOwner && (
                        <PayButton product={props.product} user={props.user}/>
                    )}
                </div>
            </div>
        </Card>

    )

}

export default ProductCard;
