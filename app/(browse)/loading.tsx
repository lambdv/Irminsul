import { Skeleton } from '@mui/material';
import React from 'react';
import explorePageCSS from '@/components/explore/explorePage.module.css';
import ItemCSS from '@/components/explore/item.module.css';

function ItemSkelleton() {
  return (<>
      <div className={ItemCSS.item + ` item `}>
          <div className={ItemCSS.itemIcon}>
              <div className='width-500 height-500'></div>
          </div>
      </div>
  </>)
}

export default function loading() {
  return (
    <div style={{"overflow":"hidden"}} className="">
      <div className='width-500 height-500'></div>
      <div className={explorePageCSS.itemContainer}>
        {
          Array.from({ length: 32 }).map((_, i) => (
            <ItemSkelleton key={i} />
          ))
        }
      </div>
    </div>
  );
}

