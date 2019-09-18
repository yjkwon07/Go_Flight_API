module.exports = (sequelize, DataTypes) => {
    return sequelize.define('domain', {
        host: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false, 
        },
        clientSecret: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
    },
         {
            timestamps: true,
            paranoid: true,
            validate: {
                unknownType() {
                    if (this.type !== 'free' && this.type !== 'premium') {
                      throw new Error('type 컬럼은 free나 premium이어야 합니다.');
                    }
                  },
            }
        });
};