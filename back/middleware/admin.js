const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.rol !== 'Administrador') {
        return res.status(403).json({ error: 'Acceso solo para administradores' });
    }

    next();
};

module.exports = adminMiddleware;
