import React from "react";
import {Connect} from "aws-amplify-react";
import {graphqlOperation} from 'aws-amplify'
import {listMarkets} from "../graphql/queries";
import {onCreateMarket} from "../graphql/subscriptions";
import Error from "./Error";
import {Loading, Icon} from "element-react";
import MarketCard from "../functions/MarketCard";
//  Use Connect Component to use grapql in a function. Otherwise it must be integrated into a component
// life cycle hook.
const MarketList = ({searchResults}) => {

    const onNewMarket = (prevQuery, newData) => {
        let updatedQuery = {...prevQuery};
        const updateMarketList = [newData.onCreateMarket,
            ...prevQuery.listMarkets.items];
        updatedQuery.listMarkets.items = updateMarketList;
        return updatedQuery;
    }
    return (<Connect
        query={graphqlOperation(listMarkets)}
        subscription={graphqlOperation(onCreateMarket)}
        onSubscriptionMsg={onNewMarket}
    >
        {({data, loading, errors}) => {
            const marketList = data.listMarkets;
            if (errors && errors.length > 0) {
                return (<Error errors={errors}/>)
            }
            if (loading && !marketList) return <Loading fullscreen={true}/>
            const markets= searchResults.length >0 ? searchResults: marketList.items;
            return (
                <>
                    {searchResults.length>0 ? (
                        <h2 className= "text-green">
                            <Icon type="success" className="icon" name="check"/>
                            {searchResults.length} Results
                        </h2>
                        ):

                        ( <h2 className="header">Markets</h2>)
                    }
                    {markets.map(market => {
                        return (
                            <div key={market.id} className="my-2">
                                <MarketCard market={market}/>
                            </div>)
                    })}
                </>
            )
        }}
    </Connect>);
};

export default MarketList;
