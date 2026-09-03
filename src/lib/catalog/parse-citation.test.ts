import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  extractReferenceDois,
  extractSelfDoiFromCff,
  parseCitationCff,
  parseZenodoJson,
} from "./parse-citation.ts";

const dir = dirname(fileURLToPath(import.meta.url));

function fixture(name: string): string {
  return readFileSync(join(dir, "fixtures", name), "utf8");
}

describe("parseCitationCff against real GenesisAeon CITATION.cff files", () => {
  it("amazon-utac: top-level package DOI is selfDoi, paper/dataset DOIs stay in references", () => {
    const parsed = parseCitationCff(fixture("amazon-utac.CITATION.cff"));
    assert.equal(parsed.selfDoi, "10.5281/zenodo.20746954");
    assert.deepEqual(parsed.dois, [
      "10.1126/sciadv.aba2949",
      "10.1038/s41558-022-01287-8",
      "10.5281/zenodo.5831935",
    ]);
    assert.equal(parsed.dois.includes("10.5281/zenodo.20746954"), false);
    assert.equal(parsed.references.length, 3);
    assert.match(parsed.abstract, /Γ_Amazon/);
    assert.equal(parsed.noUtacBridge, false);
    assert.equal(extractSelfDoiFromCff(fixture("amazon-utac.CITATION.cff")), parsed.selfDoi);
    assert.deepEqual(extractReferenceDois(fixture("amazon-utac.CITATION.cff")), parsed.dois);
  });

  it("amoc-utac: identifiers DOI is selfDoi; folded abstract and titles parse", () => {
    const parsed = parseCitationCff(fixture("amoc-utac.CITATION.cff"));
    assert.equal(parsed.selfDoi, "10.5281/zenodo.21432660");
    assert.deepEqual(parsed.dois, ["10.1126/sciadv.adk1189", "10.1038/s41467-023-39810-w"]);
    assert.match(parsed.abstract, /medium-CREP regime/);
    assert.equal(parsed.references[0]?.title.includes("Physics-based early warning"), true);
    assert.equal(parsed.noUtacBridge, false);
    assert.equal(parsed.keywords.includes("AMOC"), true);
  });

  it("cloud-feedback-utac: quoted abstract, no DOIs, no-UTAC flag from abstract", () => {
    const parsed = parseCitationCff(fixture("cloud-feedback-utac.CITATION.cff"));
    assert.equal(parsed.selfDoi, null);
    assert.deepEqual(parsed.dois, []);
    assert.equal(parsed.references.length, 2);
    assert.equal(parsed.noUtacBridge, true);
    assert.match(parsed.abstract, /deliberately no UTAC\/CREP\/AFET bridge/);
    assert.equal(parsed.version, "1.0.1");
  });

  it("ocean-acidification-utac: only cited-paper DOIs, no package DOI", () => {
    const parsed = parseCitationCff(fixture("ocean-acidification-utac.CITATION.cff"));
    assert.equal(parsed.selfDoi, null);
    assert.deepEqual(parsed.dois, ["10.1111/gcb.70238", "10.1093/nsr/nwag173"]);
    assert.equal(parsed.noUtacBridge, true);
    assert.equal(parsed.references[1]?.journal, "National Science Review");
  });

  it("permafrost-utac: dataset DOI is a reference, not the package DOI", () => {
    const parsed = parseCitationCff(fixture("permafrost-utac.CITATION.cff"));
    assert.equal(parsed.selfDoi, null);
    assert.deepEqual(parsed.dois, ["10.5285/a6fbedd8ee5b472c8e84e55f746c1704"]);
    assert.equal(parsed.references[0]?.title.includes("ESA Climate Change Initiative"), true);
    assert.equal(parsed.noUtacBridge, true);
  });
});

describe("parseZenodoJson", () => {
  it("does not treat related_identifiers (isPartOf) as the package DOI", () => {
    assert.equal(parseZenodoJson(fixture("amazon-utac.zenodo.json")), null);
    assert.equal(parseZenodoJson(fixture("amoc-utac.zenodo.json")), null);
  });

  it("reads doi and prereserve_doi when present", () => {
    assert.equal(
      parseZenodoJson(JSON.stringify({ doi: "10.5281/zenodo.20746954" })),
      "10.5281/zenodo.20746954",
    );
    assert.equal(
      parseZenodoJson(JSON.stringify({ prereserve_doi: { doi: "https://doi.org/10.5281/zenodo.1" } })),
      "10.5281/zenodo.1",
    );
  });
});
