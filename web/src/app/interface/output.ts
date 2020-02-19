export interface Output {
    ParamService: {
        params: OutputParams[];
    };
}

export interface OutputParams {
    paramaddress: string;
    paramlabel: string;
    value: number;
}
