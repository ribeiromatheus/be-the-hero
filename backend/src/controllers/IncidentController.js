const connection = require('../database/connection');

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query;

        const [count] = await connection('incidents').count();

        const incidents = await connection('incidents')
            .join('ngos', 'ngos.id', '=', 'incidents.ngo_id')
            .limit(5)
            .offset((page - 1) * 5)
            .select([
                'incidents.*',
                'ngos.name',
                'ngos.email',
                'ngos.whatsapp',
                'ngos.city',
                'ngos.uf',
            ]);

        res.header('X-Total-Count', count['count(*)']);

        return res.json(incidents);
    },

    async store(req, res) {
        const { title, description, value } = req.body;
        const { ngo_id } = req.headers;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ngo_id
        });

        return res.json({ id });
    },

    async delete(req, res) {
        const { id } = req.params;
        const { ngo_id } = req.headers;

        const incident = await connection('incidents')
            .where('id', id)
            .select('ngo_id')
            .first();

        if (incident.ngo_id !== ngo_id)
            return res.status(401).json({ error: 'Operation not permited.' });

        await connection('incidents').where('id', id).delete();

        return res.status(204).send();
    }
};