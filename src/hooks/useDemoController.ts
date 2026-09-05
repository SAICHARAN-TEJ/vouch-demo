import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { analyseContext } from "@/engine/contextEngine";
import { strengthenRoadEvent } from "@/engine/aggregation";
import { sensorProvider } from "@/sensors";
import { cameraProvider } from "@/camera";
import { useScoreStore } from "@/store/scoreStore";
import { useRideStore } from "@/store/rideStore";
import { DEMO_RIDER, DEMO_TRIP_ID, demoNow } from "@/config/demoData";
import type { ScenarioDef } from "@/config/scenarios";
import type { RiderEvent, RoadEvent } from "@/types";
import { qk } from "./queries";
export function useDemoController() {
  const qc=useQueryClient(), activeRef=useRef(false); const [isBusy,setIsBusy]=useState(false); const [error,setError]=useState<string|null>(null);
  const trigger=useCallback(async(scenario:ScenarioDef)=>{if(activeRef.current)return false;activeRef.current=true;setIsBusy(true);setError(null);try{const repo=await getRepository();if(useRideStore.getState().phase==="idle")useRideStore.getState().startRide(useScoreStore.getState().score);const sensorEvent=sensorProvider.trigger(scenario),cameraDetection=cameraProvider.trigger(scenario),roadEvents=await repo.getRoadEvents();const result=analyseContext({sensorEvent,location:scenario.location,nearbyRoadEvents:roadEvents,cameraDetection,timestamp:Date.now()});let affected:RoadEvent|null=null;const targetId=scenario.effect.strengthenRoadEventId;if(targetId){const target=roadEvents.find(e=>e.id===targetId);if(target){const added=await repo.addReport(target.id,DEMO_RIDER.id);affected=added?strengthenRoadEvent(target,{newRider:scenario.effect.newRider,now:demoNow()}):target;if(added)await repo.saveRoadEvent(affected);}}const scoreChange=useScoreStore.getState().applyEvent(result),scoreState=useScoreStore.getState(),rider=await repo.getRider();await repo.saveRider({...rider,vouchScore:scoreState.score,scoreFactors:scoreState.factors});const riderEvent:RiderEvent={id:`rider-event-${Date.now()}`,tripId:DEMO_TRIP_ID,riderId:DEMO_RIDER.id,eventType:result.eventType,latitude:scenario.location.latitude,longitude:scenario.location.longitude,motionData:sensorEvent.motion,contextResult:result,confidence:sensorEvent.confidence,createdAt:demoNow().toISOString()};await repo.saveRiderEvent(riderEvent);await Promise.all([qc.invalidateQueries({queryKey:qk.roadEvents}),qc.invalidateQueries({queryKey:qk.history}),qc.invalidateQueries({queryKey:qk.rider})]);useRideStore.getState().startAnalysis({scenario,sensorEvent,cameraDetection,result,roadEvent:affected,scoreChange});return true;}catch(cause){setError(cause instanceof Error?cause.message:"Demo scenario failed");return false;}finally{activeRef.current=false;setIsBusy(false);}},[qc]);
  const reset=useCallback(async()=>{if(activeRef.current)return false;activeRef.current=true;setIsBusy(true);setError(null);try{const repo=await getRepository();await repo.resetDemo();useScoreStore.getState().reset();useRideStore.getState().resetRide();await qc.invalidateQueries();return true;}catch(cause){setError(cause instanceof Error?cause.message:"Demo reset failed");return false;}finally{activeRef.current=false;setIsBusy(false);}},[qc]);return {trigger,reset,isBusy,error};
}
