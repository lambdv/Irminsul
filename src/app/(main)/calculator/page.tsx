import GraphWorkspace from "@/components/calculator-graph/GraphWorkspace";
import CalculatorPageWrapper from "@/components/calculator-graph/CalculatorPageWrapper";

export default function CalculatorPage() {
  return (
    <CalculatorPageWrapper>
      <div className="calculator-page-container">
        <GraphWorkspace />
      </div>
    </CalculatorPageWrapper>
  );
}


