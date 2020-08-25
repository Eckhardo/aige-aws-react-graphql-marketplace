import React from "react";
import {API, Auth, graphqlOperation, Storage} from 'aws-amplify';
import {createProduct} from "../graphql/mutations";
import aws_exports from './../aws-exports';
import {Button, Form, Input, Notification, Progress, Radio} from "element-react";
import {PhotoPicker} from "aws-amplify-react";
import {convertEuroToCents} from "../utils";


const initialState = {
    description: "",
    price: "",
    shipped: true,
    image: "",
    imagePreview: "",
    isUploading: false,
    percentageUploaded: 0
};

class NewProduct extends React.Component {

    state = {...initialState};

    handleAddPhoto = async () => {
        const userName = Auth.user.getUsername();
        console.log("userName:", userName);
        console.log("state: ", this.state);
        try {
            this.setState({isUploading: true})
            const visibility = "public";
            const {identityId} = await Auth.currentUserCredentials();
            const filename = `/${visibility}/${identityId}/${Date.now()}-${this.state.image.name}`;
            const uploadedFile = await Storage.put(filename, this.state.image.file,
                {
                    contentType: this.state.image.type,
                    progressCallback: progress => {
                        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                        const percentageUploaded = Math.round((progress.loaded / progress.total) * 100);
                        this.setState({percentageUploaded: percentageUploaded});
                    }
                });
            const file = {
                key: uploadedFile.key,
                bucket: aws_exports.aws_user_files_s3_bucket,
                region: aws_exports.aws_project_region
            }
            const input = {
                productMarketId: this.props.marketId,
                description: this.state.description,
                price: convertEuroToCents(this.state.price),
                shipped: this.state.shipped,
                file
            }
            const result = await API.graphql(graphqlOperation(createProduct, {input}));
            console.log(' New Product Uploaded', result);
            Notification({
                title: "success",
                message: `Product successfully created: ${JSON.stringify(result)}`,
                type: "success"
            })
            this.setState({isUploading: false})
        } catch (err) {
            console.error('An error occurred:', err);
        }
        this.setState({...initialState});
    }

    render() {

        const {image, imagePreview, shipped, price, description, isUploading, percentageUploaded} = this.state;
        return (

            <div className="flex-center">
                <h2 className="header">Add New Product</h2>
                <div>
                    <Form className="market-header">
                        <Form.Item label="Add Product Description">
                            <Input type="text"
                                   icon="description"
                                   placeholder="Description"
                                   value={description}
                                   onChange={description => this.setState({description})}>

                            </Input>
                        </Form.Item>
                        <Form.Item label="Add Product Price">
                            <Input type="number"
                                   icon="price"
                                   value={price}
                                   placeholder="Price (€)"
                                   onChange={price => this.setState({price})}>

                            </Input>
                        </Form.Item>
                        <Form.Item label="Is the Product Shipped or Emailed to the Customer ">
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
                        {imagePreview && (
                            <img className="image-preview"
                                 src={imagePreview}
                                 alt="Product Preview"/>
                        )}
                        {percentageUploaded > 0 && (
                            <Progress
                                type="circle"
                                status="success"
                                className="progress"
                                percentage={percentageUploaded}/>
                        )}
                        <PhotoPicker title="Product Image"
                                     preview="hidden"
                                     onPick={file => this.setState({image: file})}
                                     onLoad={url => this.setState({imagePreview: url})}
                                     theme={{
                                         formContainer: {
                                             margin: 3,
                                             padding: "0.8em",
                                             border: "1px solid #bfcbd9"
                                         },
                                         formSection: {
                                             display: "flex",
                                             flexDirection: "column",
                                             alignItems: "center",
                                             justifyContent: "center"
                                         },
                                         sectionBody: {
                                             margin: 0,
                                             width: "250px",
                                             alignContent: "center",
                                             fontSize: "14px",
                                             color: "#48576a"
                                         },
                                         photoPickerButton: {

                                             padding: "0.4em",
                                             backgroundColor: "#f7ba2a",
                                             color: "white"
                                         },
                                         sectionHeader: {
                                             padding: "0.2em",
                                             fontSize: "14px",
                                             color: "#48576a"
                                         }
                                     }}/>

                        <Form.Item>
                            <Button disabled={!price || !description || !image || isUploading}
                                    type="primary"
                                    onClick={this.handleAddPhoto}
                                    loading={isUploading}>
                                {isUploading ? 'Product is Uploading...' : 'Add Product'}
                            </Button>
                        </Form.Item>

                    </Form>
                </div>
            </div>
        )
    }
}

export default NewProduct;
