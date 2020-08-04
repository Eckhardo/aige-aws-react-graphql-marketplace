import React from "react";
import {Card, Tag} from "element-react";
import {Link} from "react-router-dom";

const MarketCard = (props) => {

    return (<Card bodyStyle={{
            padding: '0.7em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div>
           <span className="flex">
          <Link className="link" to={`/market/${props.market.id}`}>
                         {props.market.name}
          </Link>
          <span style={{color: '#FF9900'}}>
                         {props.market.products.items ? props.market.products.items.length: ""}
          </span>
          </span>
                <div style={{color: '#FF6655'}}>
                    {props.market.owner}
                </div>
            </div>
            <div>
                {props.market.tags && props.market.tags.map(tag => (
                    <Tag key={tag} type="danger" className="mx-1">
                        {tag}
                    </Tag>
                ))}
            </div>
        </Card>
    )
}

export default MarketCard;
