const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Role = db.role

// Create role
exports.createRole = async (req, res) =>{
    const roleName = req.body.roleName;
    Role.create({
        roleName: roleName
    }).then(result =>{
        res.status(StatusCode.SuccessCreated).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}


// Get all roles
exports.getRoles = async (req, res) =>{
    try{
        const role = await Role.findAll();
        res.status(StatusCode.SuccessOK).send(role)
    }catch(err){
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    }
}


// Update role
exports.updateRole = async (req, res) =>{
    const roleId = req.body.roleId;
    const roleName = req.body.roleName;
    Role.findByPk(roleId).then(role =>{
        role.roleName = roleName
        return role.save();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}

// Delete role
exports.deleteRole = async(req,res, next)=>{
    const roleId = req.body.roleId;
    Role.findByPk(roleId).then(role =>{
        return role.destroy();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send({message: `'${result.roleName}' removed as a role`});
    }).catch(err =>{
        res.status(Status.ServerErrorInternal).send({message: err.message})
    })
}

