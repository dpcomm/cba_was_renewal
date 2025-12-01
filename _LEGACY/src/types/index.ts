export type SurveyData = {
  meal: number[][];
  transfer: {
    transfer: string;
    'own-car': string;
    bus: number[];
  }
}

export type FindApplicationType = {
  id: number;
  attended: boolean;
  feePaid: boolean;
  surveyData: JSON;
  user: {
    name: string;
  };
  retreat: {
    title: string;
  };
};