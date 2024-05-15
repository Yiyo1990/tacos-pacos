interface PrimaryInterf {
    id: number,
    name: string
}

export class InsumosCatalogo implements PrimaryInterf{
    constructor(
        public id: number = 0, 
        public name: string = "Selecciona un Catalogo"
    ){}
}

export class InsumosUnidadMedida implements PrimaryInterf{
    constructor(
        public id: number = 0, 
        public name: string = "Selecciona una UM"
    ){}
}


interface InsumoInterf {
    id: number,
    ingrediente: string,
    costoStr: any,
    costo: number,
    unidad: InsumosUnidadMedida,
    catalogo: InsumosCatalogo
}

export class Insumo implements InsumoInterf{
    constructor(public id: number = 0, 
        public ingrediente: string = "", 
        public costoStr: any = 0,
        public costo: number,
        public unidad: InsumosUnidadMedida, 
        public catalogo: InsumosCatalogo){

        }
}