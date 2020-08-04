import React from "react";
// prettier-ignore
import {Button, Dialog, Form, Input, Notification, Popover, Radio} from "element-react";
import {convertCentsToEuros, convertEuroToCents} from '../utils'
import {UserContext} from "../App";
import {API, graphqlOperation} from 'aws-amplify';
import {deleteProduct, updateProduct} from "../graphql/mutations";
import ProductCard from "../functions/ProductCard";


class Product extends React.Component {
    state = {
        updateProductDialog: false,
        deleteProductDialog: false,
        price: "",
        description: "",
        shipped: false
    };

    handleUpdateProduct = async (productId) => {
        this.setState({updateProductDialog: false});
        const {description, price, shipped} = this.state;
        const input = {
            id: productId,
            description,
            price: convertEuroToCents(price),
            shipped
        }
        try {
            await API.graphql(graphqlOperation(updateProduct, {input}));
            Notification({
                    title: "Success",
                    message: 'Product successfully updated!',
                    type: 'success'
                }
            )
            setTimeout(() => window.location.reload(), 4000);
        } catch (e) {
            console.error(e);
        }
    }
    handleDelete = async (productId) => {
        this.setState({deleteProductDialog: true})
        const input = {
            id: productId
        }
        try {
            const result = await API.graphql(graphqlOperation(deleteProduct, {input}));
            console.log(result);
            Notification({
                    title: "Success",
                    message: 'Product successfully deleted!',
                    type: 'success'
                }
            )
        } catch (err) {
            console.error(err);
        }

    }

    render() {
        const {updateProductDialog, deleteProductDialog, price, description, shipped} = this.state;
        const {product} = this.props;
        return (
            <UserContext.Consumer>
                {({user}) => {
                    const isProductOwner = user && user.attributes.sub === product.owner;
                    return (<div className="card-container">
                            <ProductCard product={product} isProductOwner={isProductOwner} />
                            {/* Update and Delete*/}
                            <div className="text-center">
                                {isProductOwner && (
                                    <>
                                        <Button type="warning"
                                                icon="edit"
                                                className="m-1"
                                                onClick={() => this.setState({
                                                    updateProductDialog: true,
                                                    description: product.description,
                                                    price: convertCentsToEuros(product.price),
                                                    shipped: product.shipped
                                                })}/>
                                        <Popover
                                            placement="top"
                                            width="160"
                                            trigger="click"
                                            visible={deleteProductDialog}
                                            content={
                                                <>
                                                    <p>Do you want to delete this?</p>
                                                    <div className="text-right">
                                                        <Button size="mini"
                                                                type="text"
                                                                className="m-1"
                                                                onClick={() => this.setState({deleteProductDialog: false})}>
                                                            Cancel
                                                        </Button>
                                                        <Button size="mini"
                                                                type="primary"
                                                                className="m-1"
                                                                onClick={() => this.handleDelete(product.id)}>
                                                            Delete
                                                        </Button>

                                                    </div>
                                                </>

                                            }>
                                            <Button onClick={() => this.setState({deleteProductDialog: true})}
                                                    type="danger"
                                                    icon="delete"
                                                    className="m-1"
                                            />
                                        </Popover>
                                    </>
                                )}
                            </div>


                            {/* Update Product Dialog*/}
                            <Dialog visible={updateProductDialog}
                                    title="Update Product"
                                    customClass="dialog"
                                    size="large"
                                    onCancel={() => this.setState({updateProductDialog: false})}
                            >

                                <Form labelPosition="top" className="market-header">
                                    <Form.Item label="Update Product Description">
                                        <Input
                                            icon="information"
                                            placeholder="Description"
                                            value={description}

                                            onChange={description => this.setState({description})}>

                                        </Input>
                                    </Form.Item>
                                    <Form.Item label="Update Product Price">
                                        <Input type="number"
                                               value={price}
                                               placeholder="Price (€)"
                                               onChange={price => this.setState({price})}>

                                        </Input>
                                    </Form.Item>
                                    <Form.Item label="Update Shipping ">
                                        <Radio value="true"
                                               checked={shipped === true}
                                               onChange={() => this.setState({shipped: true})}>
                                            Shipped
                                        </Radio>
                                        <Radio value="false"
                                               checked={shipped === false}
                                               onChange={() => this.setState({shipped: false})}>

                                            EMailed
                                        </Radio>
                                    </Form.Item>
                                </Form>
                                <Dialog.Body/>
                                <Dialog.Footer>
                                    <Button
                                        onClick={() => this.setState({updateProductDialog: false})}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleUpdateProduct(product.id)}>
                                        Update
                                    </Button>
                                </Dialog.Footer>

                            </Dialog>
                        </div>
                    )
                }}
            </UserContext.Consumer>
        )

    }
}

export default Product;
