import React, { useState, useEffect, useContext } from 'react'
import { NavBar } from '../../components/NavBar'
import { SideBar } from '../DashBoard/SideBar'
import { ListarHoteles } from './ListarHoteles'
import { NombreContexto } from '../../index'
import { Link } from 'react-router-dom'
import axios from 'axios'

export const HotelesPage = () => {

    const { dataUser } = useContext(NombreContexto)
    const [hoteles, setHoteles] = useState([]);

    const getHoteles = async () => {
        try {
            const { data } = await axios('http://localhost:3418/hotels/get')
            console.log(data.hotels);
            setHoteles(data.hotels)
            console.log(dataUser);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => { getHoteles() }, [])

    console.log('d');
    console.log(hoteles);

    return (
        <>
            <section id={dataUser.role === 'ADMIN'?'concted':''}>
                <aside>
                    {
                        dataUser.role === 'ADMIN' ? (
                            <SideBar />
                        ) : <NavBar />
                    }
                </aside>

                <section id={dataUser.role === 'ADMIN' ?'proyectos':''}>
                    <div class="all-page-title page-breadcrumb">
                        <div class="container text-center">
                            <div class="row">
                                <div class="col-lg-12">
                                    <h1>Lo mejor de lo mejor....</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="centrar">

                        {dataUser.role === 'ADMIN' ? (
                            <>
                                <Link to='/addHotel' className="btn btn-warning" style={{ marginTop: '100px' }}>Nuevo Hotel</Link>
                                <Link to='/updateHotel' className="btn btn-danger" style={{ marginTop: '100px', marginLeft: '10px' }}>Editar Hotel</Link>
                            </>
                        ) : <></>
                        }
                        <div className='display-hoteles'>


                            {
                                hoteles.map(({ description, name, _id }) => {
                                    return (
                                        <ListarHoteles
                                            key={_id}
                                            name={name}
                                            address={description} />
                                    )

                                })
                            }
                        </div>
                    </div>
                </section>


            </section>



        </>
    )
}
