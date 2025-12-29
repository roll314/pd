// @ts-types='npm:@types/command-line-args'
import commandLineArgs from "npm:command-line-args";

export interface ICliArgs {
  configPath: string;
}

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  {
    name: "configPath",
    alias: "c",
    type: String,
    defaultValue: "./config.json",
  },
];

export function getArgs(): ICliArgs {
  return commandLineArgs(optionDefinitions) as ICliArgs;
}
