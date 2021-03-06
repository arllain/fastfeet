import * as Yup from 'yup';
import { Op } from 'sequelize';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

class DeliveryManController {
  async show(req, res) {
    const { id } = req.params;
    const deliveryMan = await DeliveryMan.findOne({
      where: { id },
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    });
    if (!deliveryMan) {
      return res.status(400).json({ error: 'DeliveryMan not found' });
    }

    return res.json(deliveryMan);
  }

  async index(req, res) {
    const { page = 1, q = '' } = req.query;
    const limit = 6;
    const offset = (page - 1) * limit;
    const deliveryMan = await DeliveryMan.findAll({
      attributes: ['id', 'name', 'email'],
      limit,
      offset,
      where: {
        name: {
          [Op.iLike]: `%${q}%`,
        },
      },
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
      order: ['id'],
    });
    res.json(deliveryMan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number().nullable(),
      email: Yup.string()
        .required()
        .email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const deliveryManExists = await DeliveryMan.findOne({
      where: { email: req.body.email },
    });

    if (deliveryManExists) {
      return res.status(400).json({ erro: 'DeliveryMan already exists' });
    }

    const { id, name, email, avatar_id } = await DeliveryMan.create(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async update(req, res) {
    const deliveryman_id = req.params.id;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email(),
      avatar_id: Yup.number().nullable(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const deliveryMan = await DeliveryMan.findByPk(deliveryman_id);

    if (!deliveryMan) {
      return res.status(400).json({ erro: 'DeliveryMan not found' });
    }
    const { id, name, email, avatar_id } = await deliveryMan.update(req.body);
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryMan = await DeliveryMan.destroy({
      where: { id },
    });

    if (deliveryMan) {
      return res.status(200).json({ deleted: 'The DeliveryMan was deleted' });
    }

    return res.status(400).json({ erro: 'DeliveryMan not found' });
  }
}

export default new DeliveryManController();
