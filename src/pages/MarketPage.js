import React from "react";
import {API, graphqlOperation} from 'aws-amplify';
import {onCreateProduct, onDeleteProduct, onUpdateProduct} from "../graphql/subscriptions";

import {Icon, Loading, Tabs} from "element-react";
import {Link} from "react-router-dom";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

const getMarketLocal = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
     }
  }
`;

class MarketPage extends React.Component {
    state = {
        market: null,
        isLoading: true,
        isMarketOwner: false
    };


    createObserver = {
        next: productData => {
            const newProduct = productData.value.data.onCreateProduct;
            const prevProducts = this.state.market.products.items.filter(product => {
                return product.id !== newProduct.id;
            })
            const updatedProducts = [newProduct, ...prevProducts];
            const updatedMarket = {...this.state.market};
            updatedMarket.products.items = updatedProducts;
            this.setState({market: updatedMarket})
        },
        error: errorValue => {
            console.log(errorValue);
        }
    }
    updateObserver = {
        next: updatedData => {
            const {market} = this.state;
            const products = market.products.items;
            const updatedProduct = updatedData.value.data.onUpdateProduct;
            const index = products.findIndex((item) => {
                return item.id === updatedProduct.id
            });
            const updatedProducts = [...products.slice(0, index), updatedProduct, ...products.slice(index + 1)];
            const updatedMarket = {...this.state.market};
            updatedMarket.products.items = updatedProducts;
            this.setState({market: updatedMarket})
        },
        error: errorValue => {
            console.log(errorValue);
        }
    }
    deleteObserver = {
        next: deleteData => {
            const deletedProduct = deleteData.value.data.onDeleteProduct;
            const updatedProducts = this.state.market.products.items.filter(product => {
                return product.id !== deletedProduct.id;
            })
            const prevMarket = {...this.state.market};
            prevMarket.products.items = updatedProducts;
            this.setState({market: prevMarket});
        },
        error: errorValue => {
            console.log(errorValue);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('[MarketPage] componentDidUpdate', prevState);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }


    componentDidMount() {
        console.log("MarketPage   componentDidMount",);

        const userName = this.props.user.attributes.sub;
        this.handleGetMarket();
        this.createProductObserver = API.graphql(graphqlOperation(onCreateProduct, {owner: userName}))
            .subscribe(this.createObserver)
        this.updateProductObserver = API.graphql(graphqlOperation(onUpdateProduct, {owner: userName}))
            .subscribe(this.updateObserver)
        this.deleteProductObserver = API.graphql(graphqlOperation(onDeleteProduct, {owner: userName}))
            .subscribe(this.deleteObserver);

    }

    componentWillUnmount() {
        this.createProductObserver.unsubscribe();
        this.updateProductObserver.unsubscribe();
        this.deleteProductObserver.unsubscribe();
    }

    handleGetMarket = async () => {
        const result = await API.graphql(graphqlOperation(getMarketLocal, {id: this.props.marketId}));
        this.setState({market: result.data.getMarket, isLoading: false}, () => {
            this.checkForMarketOwner();
        });
    }
    checkForMarketOwner = () => {
        const user = this.props.user;
        const {market} = this.state;
        if (user) {
            this.setState({isMarketOwner: user.username === market.owner})
        }
    }

    render() {
        const {market, isLoading, isMarketOwner} = this.state;
        return isLoading ?
            (<Loading fullscreen={true}/>)
            :
            <>
                {/* Back Button */}
                <Link className="link" to="/">
                    Back to Market List
                </Link>
                {/* Market Data */}
                <span className="items-center pt-2">
                   <h2 className="mb-mr"> {market.name}</h2> - {market.owner}
                </span>
                <div className="items-center pt-2">
                    <span style={{color: "blueviolet", paddingBottom: "1em"}}>
                        <Icon name="date" className="icon"/>
                        {market.createdAt}
                    </span>
                </div>
                {/* Product Tabs */}
                <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
                    {isMarketOwner ? <Tabs.Pane
                        label={
                            <>
                                <Icon name="plus" className="icon"/>
                                Add Product
                            </>
                        }
                        name="1">
                        <NewProduct marketId={this.props.marketId}/>
                    </Tabs.Pane> : null}

                    {/* ProductList Tabs */}
                    <Tabs.Pane
                        label={
                            <>
                                <Icon name="menu" className="icon"/>
                                Product List ({market.products.items.length})
                            </>
                        }
                        name="2">
                        <div className="product-list">
                            {market.products.items.map(product => (
                                <Product key={product.id} product={product}/>
                            ))}
                        </div>
                    </Tabs.Pane>
                </Tabs>
            </>
    }
}

export default MarketPage;
