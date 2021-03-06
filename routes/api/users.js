const express = require("express");
const botFilter = require("../../utils/botFilter");
const {botObjectSender} = require("../../utils/bot");
const router = express.Router();

module.exports = (mongo) => {
    router.get("/:id", (req, res) => {
        let query = "username discriminator avatar dates details.description"
        if (req.query.buffer !== undefined)
            query += " avatarBuffer"
        mongo.Users.findById(req.params.id).select(query).then(user => {
            if (!user)
                return res.status(404).send({
                    error: `O usuário ${req.params.id} não foi encontrado.`
                });
            res.send(user);
        });
    });

    router.get("/:id/bots", async (req, res) => {
        const user = await mongo.Users.findById(req.params.id);

        if(!user)
            return res.status(404).send({
                error: `O usuário ${req.params.id} não foi encontrado.`
            });

        const documents = await mongo.Bots.find().or([{owner: req.params.id}, {"details.otherOwners": req.params.id}]).select(botFilter(req.query));
        if(!documents || documents.length == 0)
            return res.status(406).send([])
        for(let i = 0; i < documents.length; i++){
            documents[i] = botObjectSender(documents[i]);
        }
        
        res.send(documents);
    })
    return router;
}