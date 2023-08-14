class Model {
    id?: number
    name?: string
    description?: string
    code?: string
    address?: string
    iconAsset?: string
    creationDate?: string
}

class Sucursal extends Model {
    commerces?: [Model]
}

class Marca extends Model {
    branchs?: [Sucursal]
}

export {Marca}