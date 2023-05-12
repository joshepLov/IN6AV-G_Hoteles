import React from 'react'
import { NavBar } from '../../components/NavBar'
import { ListarHoteles } from './ListarHoteles'

export const HotelesPage = () => {
    return (
        <>
            <NavBar />
            <div className='display-hoteles'>
                <ListarHoteles
                    name={'Buenos Aires'}
                    address={'Buenos Aires Argentina'} />
            </div>
        </>
    )
}
