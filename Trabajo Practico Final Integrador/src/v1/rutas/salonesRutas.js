import express from 'express';
import SalonesControlador from '../../controladores/salonesControlador.js';


const router = express.Router();
const controlador = new SalonesControlador();

router.get('/', controlador.buscarSalones.bind(controlador));
router.get('/:salon_id', controlador.buscarSalonesPorId.bind(controlador));
router.post('/', controlador.crearSalones.bind(controlador));
router.put('/:salon_id', controlador.modificarSalones.bind(controlador));
router.delete('/:salon_id', controlador.eliminarSalones.bind(controlador));

export default router;