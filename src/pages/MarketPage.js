import React from "react";
import {API, graphqlOperation} from 'aws-amplify';

import {getMarket} from "../graphql/queries";
import {Icon, Loading, Tabs} from "element-react";
import {Link} from "react-router-dom";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

class MarketPage extends React.Component {
    state = {
        market: null,
        isLoading: true,
        isMarketOwner: false
    };

    componentDidMount() {
        console.log("MarketPage  did Mount", this.state);
        this.handleGetMarket();
    }

    handleGetMarket = async () => {
        const result = await API.graphql(graphqlOperation(getMarket, {id: this.props.marketId}));
        console.log("Market:", result);
        this.setState({market: result.data.getMarket, isLoading: false}, () => {
            this.checkForMarketOwner();
        });
    }
    checkForMarketOwner = () => {
        const user = this.props.user;
        const {market} = this.state;
        if (user) {

            console.log("isMarketOwner", user.username, market.owner);
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
